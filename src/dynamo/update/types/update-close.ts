import { SlackUser, PullRequest, JSONConfig } from "../../../models";
import { DynamoGet, DynamoRemove } from "../../../dynamo/api";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";
import { getPRLink } from "../../../github/parse";
import { newLogger } from "../../../logger";

const logger = newLogger("Dynamo.UpdateClose");

/**
 * @description Update DynamoDB table to remove
 *              a PR since it has been closed
 * @param slackUserOwner Slack User owner of the PR
 * @param slackUserClosing Slack User closing the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event full event from GitHub webhook
 * @param json JSON config file
 * @returns Whether to notify slack of the closed PR
 */
export async function updateClose(
	slackUserOwner: SlackUser,
	slackUserClosing: SlackUser,
	dynamoTableName: string,
	event: any,
	json: JSONConfig,
): Promise<boolean> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();
	let foundPR: PullRequest | undefined;

	// GitHub PR Url
	const htmlUrl = getPRLink(event);

	// Team queue
	const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam);

	// Get SlackUserClosing's queue
	const dynamoUserQueue = await dynamoGet.getQueue(
		dynamoTableName,
		slackUserClosing,
	);
	foundPR = dynamoUserQueue.find((pr: PullRequest) => pr.url === htmlUrl);
	if (foundPR === undefined) {
		// If pr not found in user's queue (maybe it's the owner), check teamQueue from the owner
		foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
		if (foundPR === undefined) {
			throw new Error(
				`GitHub PR Url: ${htmlUrl} not found in ${slackUserClosing.Slack_Name}'s queue OR ` +
					`${ownerTeam.Slack_Name}'s queue`,
			);
		}
	}

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
