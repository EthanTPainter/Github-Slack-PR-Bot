import { DateTime } from "luxon";

import { DynamoGet, DynamoUpdate, DynamoRemove } from "../../api";
import { getPRLink } from "../../../github/parse";
import { SlackUser, PullRequest, JSONConfig } from "../../../models";
import { getSlackGroupAlt, getTeamOptionsAlt } from "../../../json/parse";
import { findPrInQueues } from "./helpers/find-pr-in-queues";
import { checkIfUserIsLead, checkIfUserIsMember } from "./helpers";
import { updatePrOnChangesRequested } from "./helpers/update-pr-on-changes-requested";

/**
 * @description Update PR to include changes requested
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserReqChanges Slack user who requested changes
 *                            to the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from the GitHub webhook
 * @param json JSON config file
 * @returns whether to notify slack about the changes
 */
export async function updateReqChanges(
	slackUserOwner: SlackUser,
	slackUserReqChanges: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoUpdate();
	const dynamoRemove = new DynamoRemove();
	let foundPR: PullRequest | undefined;

	// GitHub PR Url
	const htmlUrl = getPRLink(event);

	// Get PR from slackUserReqChanges's queue (matching GitHub URL)
	const dynamoQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackUserReqChanges,
	);

	// Team queue
	const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam);

	// Get PR from queue by matching PR html url
	foundPR = findPrInQueues(
		htmlUrl,
		slackUserReqChanges,
		dynamoQueue,
		ownerTeam,
		teamQueue,
	);

	// Make timestamp for last updated time
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);

	// Create new event from slackUserReqChanges
	const newEvent = {
		user: slackUserReqChanges,
		action: "CHANGES_REQUESTED",
		time: currentTime,
	};

	// Get team options for # of required approvals
	const teamOptions = getTeamOptionsAlt(slackUserOwner, json);

	// Determine if the slack user requesting changes is a member or lead
	// If slackUserReqChanges is found as a lead & member, throw error
	const foundLead = checkIfUserIsLead(slackUserReqChanges, json);
	const foundMember = checkIfUserIsMember(slackUserReqChanges, json);
	if (foundLead && foundMember) {
		throw new Error(
			`${slackUserReqChanges.Slack_Name} set as both a member and lead. Pick one`,
		);
	}

	// Construct new PR from the existing PR
	const updatedPR = updatePrOnChangesRequested(
		slackUserOwner,
		slackUserReqChanges,
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

	// Remove PR from leftover users & user who request changes
	const removePRFromUsers = updatedPR.leftoverLeads
		.concat(updatedPR.leftoverMembers)
		.concat(slackUserReqChanges);

	await Promise.all(
		removePRFromUsers.map(async (removeUser) => {
			const dynamoUserQueue = await dynamoGet.getQueue(
				dynamoTableName,
				removeUser,
			);

			await dynamoRemove.removePullRequest(
				dynamoTableName,
				removeUser,
				dynamoUserQueue,
				updatedPR.pr,
			);
		}),
	);

	// Update all queues with members and leads to alert
	const allAlertingUserIds = updatedPR.pr.standard_leads_alert
		.concat(updatedPR.pr.standard_members_alert)
		.concat(updatedPR.pr.req_changes_leads_alert)
		.concat(updatedPR.pr.req_changes_members_alert);

	await Promise.all(
		allAlertingUserIds.map(async (alertUser) => {
			const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUser);

			await dynamoUpdate.updatePullRequest(
				dynamoTableName,
				alertUser,
				currentQueue,
				updatedPR.pr,
			);
		}),
	);

	return true;
}
