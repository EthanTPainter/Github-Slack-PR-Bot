import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";

/**
 * @description Update DynamoDB table for merged PRs
 *              and remove from all queues necessary.
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserMerging Slack User merging the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from GitHub
 * @param json JSON config file
 */
export async function updateMerge(
  slackUserOwner: SlackUser,
  slackUserMerging: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // Get GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserMerging's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(dynamoTableName, slackUserMerging.Slack_Id);
  const foundPR = dynamoQueue.find((pr: PullRequest) => {
    return pr.url === htmlUrl;
  });
  if (foundPR === undefined) {
    throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserMerging.Slack_Name}'s queue`);
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
