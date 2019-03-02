import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import { getSlackUserAlt, getSlackGroupAlt } from "../../../json/parse";

/**
 * @description Update DynamoDB table for merged PRs
 *              and remove from all queues necessary.
 * @param slackUser Slack User ID
 * @param slackTeam Slack Team ID
 * @param event Event from GitHub
 * @param json JSON config file
 */
export async function updateMerge(
  slackUserOwner: SlackUser,
  slackUserMerging: SlackUser,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // Get GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserMerging's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(slackUserMerging.Slack_Id);
  const foundPR = dynamoQueue.find((pr: PullRequest) => {
    return pr.url === htmlUrl;
  });
  if (foundPR === undefined) {
    throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserMerging.Slack_Name}'s queue`);
  }

  // Remove PR from all members and leads to alert
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(alertUserId);
    const alertSlackUser = getSlackUserAlt(alertUserId, json);
    await dynamoRemove.removePullRequest(alertSlackUser, currentQueue, foundPR);
  });

  // Remove PR from owner's team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(ownerTeam.Slack_Id);
  await dynamoRemove.removePullRequest(ownerTeam, teamQueue, foundPR);
}
