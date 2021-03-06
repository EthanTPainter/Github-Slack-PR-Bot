import { DateTime } from "luxon";
import { PullRequest, JSONConfig } from "../../../models";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";
import { DynamoRemove, DynamoUpdate, DynamoGet } from "../../api";

/**
 * @description Given a PR has user(s) requesting changes,
 * this updates queues and alerts people in Slack that the
 * PR is fixed
 * @param slackUserId Slack user's id
 * @param slackUserQueue Slack user's queue
 * @param slackOwnerQueue PR Owner's queue
 * @param dynamoTableName Name of the dynamo table
 * @param json JSON Config file
 * @returns string of the expected slack message
 */
export async function updateFixedPR(
	slackOwnerId: string,
	fixedPRUrl: string,
	slackOwnerQueue: PullRequest[],
	dynamoTableName: string,
	json: JSONConfig,
): Promise<string> {
	// Verify the PR is in the queue
	const foundPR = slackOwnerQueue.find((pr) => {
		return pr.url === fixedPRUrl;
	});
	if (!foundPR) {
		throw new Error(
			`Provided PR Url: ${fixedPRUrl}, not found in ${slackOwnerId} 's queue`,
		);
	}

	// Setup
	const dynamoRemove = new DynamoRemove();
	const dynamoUpdate = new DynamoUpdate();
	const dynamoGet = new DynamoGet();

	// Move all users requesting changes to req changes alerts
	// Make users requesting changes empty
	foundPR.req_changes_members_alert = foundPR.members_req_changes;
	foundPR.req_changes_leads_alert = foundPR.leads_req_changes;
	foundPR.members_req_changes = [];
	foundPR.leads_req_changes = [];

	// Get list of all members & leads who requested changes
	const allUsersReqChanges = foundPR.req_changes_members_alert.concat(
		foundPR.req_changes_leads_alert,
	);

	// Remove PR owner from members or leads to alert
	foundPR.standard_leads_alert = foundPR.standard_leads_alert.filter(
		(alertedLead) => {
			return alertedLead.Slack_Id !== slackOwnerId;
		},
	);
	foundPR.standard_members_alert = foundPR.standard_members_alert.filter(
		(alertedMember) => {
			return alertedMember.Slack_Id !== slackOwnerId;
		},
	);

	// Push new event onto PR events
	const slackOwner = getSlackUserAlt(slackOwnerId, json);
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);
	const newEvent = {
		user: slackOwner,
		action: "FIXED_PR",
		time: currentTime,
	};
	foundPR.events.push(newEvent);

	// Remove PR from owner's queue since the PR is fixed
	await dynamoRemove.removePullRequest(
		dynamoTableName,
		slackOwner,
		slackOwnerQueue,
		foundPR,
	);

	// Update Team Queue
	const teamGroup = getSlackGroupAlt(slackOwnerId, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, slackOwner);
	await dynamoUpdate.updatePullRequest(
		dynamoTableName,
		teamGroup,
		teamQueue,
		foundPR,
	);

	// Update Dynamo Queues for all other impacted users
	const impactedUsers = foundPR.standard_leads_alert
		.concat(foundPR.standard_members_alert)
		.concat(foundPR.req_changes_leads_alert)
		.concat(foundPR.req_changes_members_alert);

	await impactedUsers.map(async (user) => {
		await dynamoUpdate.updatePullRequest(
			dynamoTableName,
			user,
			slackOwnerQueue,
			foundPR,
		);
	});

	// Notify all members & leads who requested changes
	// that the PR is ready to review
	let allUsersString = "";
	allUsersReqChanges.map((user) => {
		allUsersString += `${user.Slack_Id} `;
	});

	// Get Slack User from slackUserId & format final string
	const fixedString = `${slackOwner.Slack_Name} has fixed PR: ${fixedPRUrl}. ${allUsersString}`;
	return fixedString;
}
