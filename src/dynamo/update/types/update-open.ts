import { DynamoDB } from "aws-sdk";

import { DynamoGet, DynamoAppend } from "../../api";
import { formatNewPullRequest } from "../../formatting/format-new-pr";
import { getTeamOptionsAlt } from "../../../json/parse";
import { newLogger } from "../../../logger";
import { SlackUser, JSONConfig } from "../../../models";

const logger = newLogger("Dynamo.UpdateOpen");

/**
 * @description Update DynamoDB table for opened PRs
 *              and add to all queues necessary.
 * @param slackUser Slack User
 * @param slackTeam Slack Team
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from GitHub webhook
 * @param json JSON config file
 */
export async function updateOpen(
	slackUser: SlackUser,
	slackTeam: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Format an PullRequest as a Dynamo entry
	const newPullRequest = formatNewPullRequest(slackUser, event, json);

	// Retrieve team options
	const teamOptions = getTeamOptionsAlt(slackUser, json);

	// Create list of slack users to update which user queues in Dynamo
	const slackUserList: SlackUser[] = [];
	if (
		teamOptions.Num_Required_Lead_Approvals === 0 &&
		teamOptions.Num_Required_Member_Approvals === 0
	) {
		// Keep slackUserList empty -- Don't alert anyone
	} else if (
		teamOptions.Member_Before_Lead === true &&
		teamOptions.Num_Required_Member_Approvals > 0
	) {
		const memberIds = newPullRequest.standard_members_alert;
		memberIds.map((member: SlackUser) => {
			slackUserList.push(member);
		});
	} else {
		const members = newPullRequest.standard_members_alert;
		const leads = newPullRequest.standard_leads_alert;
		leads.map((lead: SlackUser) => {
			slackUserList.push(lead);
		});
		members.map((member: SlackUser) => {
			slackUserList.push(member);
		});
	}

	// For each user in the slackUserList,
	// 1) Get Most recent queue for the user
	// 2) Append newPullRequest to the existing queue

	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoAppend();

	const updateUserQueues = slackUserList.map(async (user) => {
		const currentQueue = await dynamoGet.getQueue(
			dynamoTableName,
			user,
		);
		await dynamoUpdate.appendPullRequest(
			dynamoTableName,
			user,
			currentQueue,
			newPullRequest,
		);
	});
	await Promise.all(updateUserQueues);

	// Append new PR to team queue
	const currentTeamQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackTeam,
	);

	await dynamoUpdate.appendPullRequest(
		dynamoTableName,
		slackTeam,
		currentTeamQueue,
		newPullRequest,
	);

	return true;
}
