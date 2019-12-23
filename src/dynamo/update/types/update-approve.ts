import { DateTime } from "luxon";
import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove, DynamoUpdate } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import {
	getTeamOptionsAlt,
	getSlackLeadsAlt,
	getSlackMembersAlt,
	getSlackGroupAlt,
	getSlackUserAlt,
} from "../../../json/parse";
import { updateLeadAlerts } from "./helpers/update-lead-alerts";
import { updateMemberAlerts } from "./helpers/update-member-alerts";

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
	json: any,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();
	const dynamoUpdate = new DynamoUpdate();
	let foundPR: PullRequest | undefined;

	// Get url from event
	const htmlUrl = getPRLink(event);

	// Get queue from slackUserApproving
	const dynamoQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackUserApproving,
	);

	// Team queue
	const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(
		dynamoTableName,
		ownerTeam,
	);

	// Check slackUserApproving's queue
	foundPR = dynamoQueue.find((pr: PullRequest) => pr.url === htmlUrl);
	if (foundPR === undefined) {
		// If not found in slackUserApproving's queue, check team queue
		foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
		if (foundPR === undefined) {
			throw new Error(
				`GitHub PR Url: ${htmlUrl} not found in ${slackUserApproving.Slack_Name}'s queue OR ` +
					`${ownerTeam.Slack_Name}'s queue`,
			);
		}
	}

	// Make timestamp for last updated time
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);

	// Add new approve event from slackUserApproving
	const newEvent = {
		user: slackUserApproving,
		action: "APPROVED",
		time: currentTime,
	};
	foundPR.events.push(newEvent);

	// Get team options for # of required approvals
	const teamOptions = getTeamOptionsAlt(slackUserOwner, json);

	// Determine if the slackUserApproving is a member or lead
	// If slackUserApproving is found as a lead & member, throw error
	const slackUserApprovingLeads = getSlackLeadsAlt(slackUserApproving, json);
	const slackUserApprovingMembers = getSlackMembersAlt(
		slackUserApproving,
		json,
	);
	let foundLead = false;
	let foundMember = false;
	slackUserApprovingLeads.map((lead: SlackUser) => {
		if (lead.Slack_Id === slackUserApproving.Slack_Id) {
			foundLead = true;
		}
	});
	slackUserApprovingMembers.map((member: SlackUser) => {
		if (member.Slack_Id === slackUserApproving.Slack_Id) {
			foundMember = true;
		}
	});
	if (foundLead && foundMember) {
		throw new Error(
			`${slackUserApproving.Slack_Name} set as a member and lead. Pick one!`,
		);
	}

	// Update lead or member specific properties
	let leftoverAlertedLeads: SlackUser[] = [];
	let leftoverAlertedMembers: SlackUser[] = [];
	if (foundLead) {
		const result = await updateLeadAlerts(
			foundPR,
			slackUserOwner,
			slackUserApproving,
			teamOptions,
			true,
			dynamoTableName,
			json,
		);
		foundPR = result.pr;
		leftoverAlertedLeads = result.leftLeads;
	}
	if (foundMember) {
		const result = await updateMemberAlerts(
			foundPR,
			slackUserOwner,
			slackUserApproving,
			teamOptions,
			true,
			dynamoTableName,
			json,
		);
		foundPR = result.pr;
		leftoverAlertedMembers = result.leftMembers;
	}

	// Update team queue
	await dynamoUpdate.updatePullRequest(
		dynamoTableName,
		ownerTeam,
		teamQueue,
		foundPR,
	);

	// Remove this PR from leftover users & slackUserApproving queues
	const removePRFromUsers = leftoverAlertedLeads
		.concat(leftoverAlertedMembers)
		.concat(slackUserApproving);
	await Promise.all(
		removePRFromUsers.map(async (removeUser) => {
			const dynamoApproverQueue = await dynamoGet.getQueue(
				dynamoTableName,
				removeUser,
			);

			await dynamoRemove.removePullRequest(
				dynamoTableName,
				removeUser.Slack_Id,
				dynamoApproverQueue,
				foundPR!,
			);
		}),
	);

	// Update all queues with members and leads to alert
	const allAlertingUserIds = foundPR.standard_leads_alert
		.concat(foundPR.standard_members_alert)
		.concat(foundPR.req_changes_leads_alert)
		.concat(foundPR.req_changes_members_alert);

	await Promise.all(
		allAlertingUserIds.map(async (alertUser) => {
			const currentQueue = await dynamoGet.getQueue(
				dynamoTableName,
				alertUser,
			);

			await dynamoUpdate.updatePullRequest(
				dynamoTableName,
				alertUser,
				currentQueue,
				foundPR!,
			);
		}),
	);

	return true;
}
