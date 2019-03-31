import { DateTime } from "luxon";
import { SlackUser } from "../../../models";
import { getPRLink } from "../../../github/parse";
import { getSlackGroupAlt } from "../../../json/parse";
import { processCommentingUserReqChanges } from "./helpers/comment-changes-alerts";
import { DynamoGet, DynamoUpdate, DynamoRemove } from "../../../dynamo/api";

/**
 * @description Update DynamoDB table to add a comment
 *              action to the PR
 * @param slackUserOwner Slack user who owns the queue
 * @param slackUserCommenting Slack user commenting
 * @param dynamoTableName Name of the dynamo table
 * @param event full event from GitHub webhook
 * @param json JSON config file
 */
export async function updateComment(
  slackUserOwner: SlackUser,
  slackUserCommenting: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoUpdate = new DynamoUpdate();
  let foundPR: any;

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // Check slackUserCommenting's queue
  const dynamoUserQueue = await dynamoGet.getQueue(dynamoTableName,
    slackUserCommenting.Slack_Id);
  foundPR = dynamoUserQueue.find((pr) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    // If not found in slackUserCommenting's queue (maybe it's the owner), check team queue
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in ${slackUserCommenting.Slack_Name}'s queue OR `
        + `${ownerTeam.Slack_Name}'s queue`);
    }
  }

  // Make timestamp for last updated time & Add new comment event from slackUserCommenting
  const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
  const newEvent = {
    user: slackUserCommenting,
    action: "COMMENTED",
    time: currentTime,
  };
  foundPR.events.push(newEvent);

  // If user commenting requested changes
  // make sure pr owner is alerted
  await processCommentingUserReqChanges(
    slackUserOwner,
    slackUserCommenting,
    foundPR,
    dynamoTableName,
    json);

  // Update commented event on team queue
  await dynamoUpdate.updatePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);

  // For all members and leads to alert, update each PR from each user queue
  const allAlertingUserIds = foundPR.standard_leads_alert.concat(foundPR.standard_members_alert);
  await Promise.all(allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(
      dynamoTableName,
      alertUserId);

    await dynamoUpdate.updatePullRequest(
      dynamoTableName,
      alertUserId,
      currentQueue,
      foundPR);
  }));

}
