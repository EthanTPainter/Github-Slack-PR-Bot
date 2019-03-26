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
  let foundPR: any;

  // Get GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // Get SlackUserMerging's queue
  const dynamoUserQueue = await dynamoGet.getQueue(dynamoTableName, slackUserMerging.Slack_Id);
  foundPR = dynamoUserQueue.find((pr: PullRequest) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    // If pr not found in user's queue (maybe it's the owner), check teamQueue ffrom the owner
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in ${slackUserMerging.Slack_Name}'s queue OR `
        + `${ownerTeam.Slack_Name}'s queue`);
    }
  }

  // Remove PR from owner's team queue
  await dynamoRemove.removePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);

  // Remove PR from all members and leads to alert
  const allAlertingUserIds = foundPR.standard_leads_alert.concat(foundPR.standard_members_alert);
  await Promise.all(allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUserId);
    const alertSlackUser = getSlackUserAlt(alertUserId, json);
    await dynamoRemove.removePullRequest(dynamoTableName, alertSlackUser.Slack_Id, currentQueue, foundPR);
  }));

}
