import { DynamoGet, DynamoAppend } from "../../api";
import { getPRLink } from "../../../github/parse";
import { SlackUser, PullRequest } from "../../../models";
import { DateTime } from "luxon";

export async function updateReqChanges(
  slackUserOwner: SlackUser,
  slackUserReqChanges: SlackUser,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoAppend = new DynamoAppend();

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserReqChanges's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(slackUserReqChanges.Slack_Id);
  const foundPR = dynamoQueue.find((pr: PullRequest) => {
    return pr.url === htmlUrl;
  });
  if (foundPR === undefined) {
    throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserReqChanges.Slack_Name}'s queue`);
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
}
