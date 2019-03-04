import { DateTime } from "luxon";
import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoUpdate } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import { getSlackGroupAlt } from "../../../json/parse";

/**
 * @description Update DynamoDB table to add a comment
 *              action to the PR
 * @param slackUserOwner Slack user who owns the queue
 * @param slackUserCommenting Slack user commenting
 * @param event full event from GitHub webhook
 * @param json JSON config file
 */
export async function updateComment(
  slackUserOwner: SlackUser,
  slackUserCommenting: SlackUser,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoUpdate = new DynamoUpdate();

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserOwner's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(slackUserCommenting.Slack_Id);
  const foundPR = dynamoQueue.find((pr: PullRequest) => {
    return pr.url === htmlUrl;
  });
  if (foundPR === undefined) {
    throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserCommenting.Slack_Name}'s queue`);
  }

  // Make timestamp for last updated time
  const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

  // Add new comment event from slackUserCommenting
  const newEvent = {
    user: slackUserCommenting,
    action: "COMMENTED",
    time: currentTime,
  };
  foundPR.events.push(newEvent);

  // For all members and leads to alert, update each PR from each user queue
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(alertUserId);
    await dynamoUpdate.updatePullRequest(alertUserId, currentQueue, foundPR);
  });

  // Update action on team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(ownerTeam.Slack_Id);
  await dynamoUpdate.updatePullRequest(ownerTeam.Slack_Id, teamQueue, foundPR);
}
