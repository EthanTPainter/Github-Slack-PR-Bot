import { SlackUser, PullRequest, JSONConfig } from "../../../models";
import { DynamoGet, DynamoRemove } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";
import { findPrInQueues } from "./helpers/find-pr-in-queues";

/**
 * @description Update DynamoDB table for merged PRs
 *              and remove from all queues necessary.
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserMerging Slack User merging the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from GitHub
 * @param json JSON config file
 * @returns Whether to notify slack a PR has been merged
 */
export async function updateMerge(
	slackUserOwner: SlackUser,
	slackUserMerging: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();

	// Get GitHub PR Url
	const htmlUrl = getPRLink(event);

	// Team queue
	const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam);

	// Get SlackUserMerging's queue
	const dynamoUserQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackUserMerging,
	);

	// Find PR in user or team queue
	const foundPR = findPrInQueues(
		htmlUrl,
		slackUserMerging,
		dynamoUserQueue,
		ownerTeam,
		teamQueue,
	);

	// Remove PR from owner's team queue
	await dynamoRemove.removePullRequest(
		dynamoTableName,
		ownerTeam,
		teamQueue,
		foundPR,
	);

	// Remove PR from all members and leads to alert
	const allAlertingUserIds = foundPR.standard_leads_alert
		.concat(foundPR.standard_members_alert)
		.concat(foundPR.req_changes_leads_alert)
		.concat(foundPR.req_changes_members_alert);

	await Promise.all(
		allAlertingUserIds.map(async (alertUser) => {
			const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUser);
			const alertSlackUser = getSlackUserAlt(alertUser.Slack_Id, json);
			await dynamoRemove.removePullRequest(
				dynamoTableName,
				alertSlackUser,
				currentQueue,
				foundPR!,
			);
		}),
	);

	return true;
}
