import { SlackUser, PullRequest } from "../../../models";
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
  let foundPR: any;

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // If SlackUserOwner is the SlackUserClosing, don't bother checking queue
  if (slackUserOwner.Slack_Id !== slackUserClosing.Slack_Id) {
    const dynamoUserQueue = await dynamoGet.getQueue(dynamoTableName, slackUserClosing.Slack_Id);
    foundPR = dynamoUserQueue.find((pr: PullRequest) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserClosing.Slack_Name}'s queue`);
    }
  }
  else {
    // Not sure which queues have the PR? Use team queue as reference
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${ownerTeam.Slack_Name}'s queue`);
    }
  }

  // Remove PR from owner's team queue
  await dynamoRemove.removePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);

  // Remove PR from all members and leads to alert
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  await Promise.all(allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(dynamoTableName, alertUserId);
    const alertSlackUser = getSlackUserAlt(alertUserId, json);
    await dynamoRemove.removePullRequest(dynamoTableName, alertSlackUser.Slack_Id, currentQueue, foundPR);
  }));

}
