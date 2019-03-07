import { DateTime } from "luxon";
import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove } from "../../../dynamo/api";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";
import { getPRLink } from "../../../github/parse";
import { requiredEnvs } from "src/required-envs";

/**
 * @description Update DynamoDB table to remove
 *              a PR since it has been closed
 * @param slackUserOwner Slack User owner of the PR
 * @param slackUserClosing Slack User closing the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event full event from GitHub webhook
 * @param json JSON config file
 * @returns void
 */
export async function updateClose(
  slackUserOwner: SlackUser,
  slackUserClosing: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from SlackUserClosing's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(dynamoTableName, slackUserClosing.Slack_Id);
  const foundPR = dynamoQueue.find((pr: PullRequest) => {
    return pr.url === htmlUrl;
  });
  if (foundPR === undefined) {
    throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserClosing.Slack_Name}'s queue`);
  }

  // Remove PR from all members and leads to alert
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUserId);
    const alertSlackUser = getSlackUserAlt(alertUserId, json);
    await dynamoRemove.removePullRequest(dynamoTableName, alertSlackUser.Slack_Id, currentQueue, foundPR);
  });

  // Remove PR from owner's team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);
  await dynamoRemove.removePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);
}
