import { DynamoGet, DynamoAppend, DynamoUpdate } from "../../api";
import { getPRLink } from "../../../github/parse";
import { SlackUser, PullRequest } from "../../../models";
import { DateTime } from "luxon";
import { getSlackGroupAlt, getTeamOptionsAlt } from "../../../json/parse";

/**
 * @description Update PR to include changes requested
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserReqChanges Slack user who requested changes
 *                            to the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from the GitHub webhook
 * @param json JSON config file
 */
export async function updateReqChanges(
  slackUserOwner: SlackUser,
  slackUserReqChanges: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoAppend = new DynamoAppend();
  const dynamoUpdate = new DynamoUpdate();
  let foundPR: any;

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserReqChanges's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(
    dynamoTableName,
    slackUserReqChanges.Slack_Id);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // Get PR from queue by matching PR html url
  foundPR = dynamoQueue.find((pr: PullRequest) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    // If not found in user's queue, check team queue
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserReqChanges.Slack_Name}'s queue`);
    }
  }

  // Make timestamp for last updated time
  const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

  // Add new changes requested event from slackUserReqChanges
  const newEvent = {
    user: slackUserReqChanges,
    action: "CHANGES_REQUESTED",
    time: currentTime,
  };
  foundPR.events.push(newEvent);

  // Get team options for # of required approvals
  const teamOptions = getTeamOptionsAlt(slackUserOwner, json);
  const reqLeadApprovals = teamOptions.Num_Required_Lead_Approvals;
  const reqMemberApprovals = teamOptions.Num_Required_Member_Approvals;

  // Determine if the slack user requesting changes is a member or lead
  // If slackUserReqChanges
}
