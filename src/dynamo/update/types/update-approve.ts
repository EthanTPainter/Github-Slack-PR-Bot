import { DateTime } from "luxon";
import { SlackUser, PullRequest, JSONConfig } from "../../../models";
import { DynamoGet, DynamoRemove, DynamoUpdate } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import { getTeamOptionsAlt, getSlackGroupAlt } from "../../../json/parse";
import {
	checkIfUserIsLead,
	checkIfUserIsMember,
} from "./helpers/check-user-role";
import { findPrInQueues } from "./helpers/find-pr-in-queues";
import { updatePrOnApprove } from "./helpers/update-pr-on-approve";

/**
 * @description Update a PR to include an approved user
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserApproving Slack user who approved the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event sent from the GitHub webhook
 * @param json JSON config file
 * @returns Whether to alert slack notifications
 */
export async function updateApprove(
	slackUserOwner: SlackUser,
	slackUserApproving: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();
	const dynamoUpdate = new DynamoUpdate();

	// Get url from event
	const htmlUrl = getPRLink(event);

	// Get queue from slackUserApproving
	const userApprovingQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackUserApproving,
	);

	// Team queue & team options
	const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam);
	const teamOptions = getTeamOptionsAlt(slackUserOwner, json);

	// Find PR in slack user approving's queue or in the team queue of the PR owner
	const foundPR = findPrInQueues(
		htmlUrl,
		slackUserApproving,
		userApprovingQueue,
		ownerTeam,
		teamQueue,
	);

	// new approve event from slackUserApproving
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);
	const newEvent = {
		user: slackUserApproving,
		action: "APPROVED",
		time: currentTime,
	};

	// Determine if the slackUserApproving is a member or lead
	// If slackUserApproving is found as a lead & member, throw error
	const foundLead = checkIfUserIsLead(slackUserApproving, json);
	const foundMember = checkIfUserIsMember(slackUserApproving, json);
	if (foundLead && foundMember) {
		throw new Error(
			`${slackUserApproving.Slack_Name} set as a member and lead. Pick one!`,
		);
	}

	// Construct new PR from the existing PR
	const updatedPR = updatePrOnApprove(
		slackUserOwner,
		slackUserApproving,
		foundMember,
		teamOptions,
		foundPR,
		newEvent,
		json,
	);

	// Update team queue
	await dynamoUpdate.updatePullRequest(
		dynamoTableName,
		ownerTeam,
		teamQueue,
		updatedPR.pr,
	);

	// Update all other queues with members and leads to alert
	const allAlertingUsers = updatedPR.pr.standard_leads_alert
		.concat(updatedPR.pr.standard_members_alert)
		.concat(updatedPR.pr.req_changes_leads_alert)
		.concat(updatedPR.pr.req_changes_members_alert);

	// Filter all alerted users compared to those that were removed from alerting
	// If the alerted user should not be updated
	// Don't save this user to update
	// const filteredAlertingUsers = allAlertingUsers.filter((alertedUser) => {
	// 	const found = removePRFromUsers.find((user) => {
	// 		return user.Slack_Id === alertedUser.Slack_Id;
	// 	});
	// 	return found ? false : true;
	// });

	await Promise.all(
		allAlertingUsers.map(async (alertUser) => {
			const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUser);

			await dynamoUpdate.updatePullRequest(
				dynamoTableName,
				alertUser,
				currentQueue,
				updatedPR.pr,
			);
		}),
	);

	// Remove this PR from leftover users & slackUserApproving queues
	const removePRFromUsers = updatedPR.leftoverLeads
		.concat(updatedPR.leftoverMembers)
		.concat(slackUserApproving);

	await Promise.all(
		removePRFromUsers.map(async (removeUser) => {
			const dynamoApproverQueue = await dynamoGet.getQueue(
				dynamoTableName,
				removeUser,
			);

			await dynamoRemove.removePullRequest(
				dynamoTableName,
				removeUser,
				dynamoApproverQueue,
				updatedPR.pr,
			);
		}),
	);

	return true;
}
