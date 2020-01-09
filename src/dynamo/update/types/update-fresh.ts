import { SlackUser, PullRequest, JSONConfig } from "../../../../src/models";
import {
	DynamoGet,
	DynamoUpdate,
	DynamoRemove,
} from "../../../../src/dynamo/api";
import { newLogger } from "../../../../src/logger";
import { getPRLink } from "../../../../src/github/parse";
import { DateTime } from "luxon";
import { getTeamOptionsAlt, getSlackUserAlt } from "../../../../src/json/parse";
import { findPrInQueues } from "./helpers/find-pr-in-queues";

const logger = newLogger("UpdateFresh");

/**
 * @description If this function is called, assumes that a PR needs to be
 * updated since a commit was made on a PR that requires fresh approvals
 * @param slackUserOwner Slack User who owns the PR
 * @param slackUserGroup Slack Group the Slack User is a part of
 * @param dynamoTableName Dynamo table name
 * @param event GitHub event from GitHub webhook
 * @param json JSON Config file
 */
export async function updateFresh(
	slackUserOwner: SlackUser,
	slackUserGroup: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoUpdate();
	const dynamoRemove = new DynamoRemove();

	// Validate that a pull request is attached to the event
	if (!event && !event.pull_request) {
		logger.error(
			`Unable to update DynamoDB on push event. Event missing required properties`,
		);
		return false;
	}

	// Get PR Url
	const htmlUrl = getPRLink(event);

	// Retrieve Team Queue
	const team = getSlackUserAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, slackUserGroup);
	const teamOptions = getTeamOptionsAlt(slackUserOwner, json);

	// Retrieve PR from queue by matching html url
	const userQueue = await dynamoGet.getQueue(dynamoTableName, slackUserOwner);

	// Find PR from user or team queues
	const pr = findPrInQueues(
		htmlUrl,
		slackUserOwner,
		userQueue,
		team,
		teamQueue,
	);

	// Make timestamp for last updated time
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);

	// Add new changes to event from the owner
	const newEvent = {
		user: slackUserOwner,
		action: "PUSH",
		time: currentTime,
	};
	pr.events.push(newEvent);

	/*
	 * Remove PR from lead queues
	 * If the team option Member_Before_Lead is set to true
	 * and the PR's member_complete property is true
	 */
	if (teamOptions.Member_Before_Lead && pr.member_complete) {
		const teamLeads = pr.leads_approving.concat(pr.standard_leads_alert);
		teamLeads.forEach(async (lead) => {
			const currentLeadQueue = await dynamoGet.getQueue(dynamoTableName, lead);
			await dynamoRemove.removePullRequest(
				dynamoTableName,
				lead,
				currentLeadQueue,
				pr!,
			);
		});
	}

	// Create new standard alerts
	const newStandardMemberAlerts =
		teamOptions.Num_Required_Member_Approvals === 0
			? []
			: pr.members_approving.concat(pr.standard_members_alert);

	const newStandardLeadAlerts =
		(teamOptions.Member_Before_Lead &&
			teamOptions.Num_Required_Member_Approvals > 0) ||
		(!teamOptions.Member_Before_Lead &&
			teamOptions.Num_Required_Lead_Approvals === 0)
			? []
			: pr.leads_approving.concat(pr.standard_leads_alert);

	// Update PR to move any members or leads approving to alert
	const updatedPR: PullRequest = {
		...pr,
		lead_complete: teamOptions.Num_Required_Lead_Approvals === 0 ? true : false,
		member_complete:
			teamOptions.Num_Required_Member_Approvals === 0 ? true : false,

		leads_approving: [],
		members_approving: [],
		standard_leads_alert: newStandardLeadAlerts,
		standard_members_alert: newStandardMemberAlerts,

		// Any users requesting changes or alerted from fixed PR should be the same
		leads_req_changes: pr.leads_req_changes,
		members_req_changes: pr.members_req_changes,
		req_changes_leads_alert: pr.req_changes_leads_alert,
		req_changes_members_alert: pr.req_changes_members_alert,
	};

	// Update team queue
	await dynamoUpdate.updatePullRequest(
		dynamoTableName,
		slackUserGroup,
		teamQueue,
		updatedPR,
	);

	// Update queue for every lead or member in the updated pr standard alerts
	// Also update queue for leads/members requesting changes
	const usersToUpdate = updatedPR.standard_leads_alert
		.concat(updatedPR.standard_members_alert)
		.concat(updatedPR.req_changes_leads_alert)
		.concat(updatedPR.req_changes_members_alert);

	await Promise.all(
		usersToUpdate.map(async (user) => {
			const currentQueue = await dynamoGet.getQueue(dynamoTableName, user);

			await dynamoUpdate.updatePullRequest(
				dynamoTableName,
				user,
				currentQueue,
				updatedPR,
			);
		}),
	);

	if (
		(teamOptions.Num_Required_Member_Approvals > 0 &&
			pr.members_approving.length + pr.req_changes_members_alert.length > 0) ||
		(teamOptions.Num_Required_Lead_Approvals &&
			pr.leads_approving.length + pr.req_changes_leads_alert.length > 0)
	) {
		return true;
	}
	return false;
}
