import { SlackUser } from "../../../../models";

/**
 * @author Ethan T Painter
 * @description Construct the description when a user comments
 * @param slackUser The slack user who opened the PR
 * @param commentingUser The slack user who commented on the PR
 */
export function constructCommentDesc(
  slackUser: SlackUser,
  commentingUser: SlackUser,
): string {

  // Error handling
  if (slackUser.Slack_Name === undefined
    || slackUser.Slack_Id === undefined) {
    throw new Error("slackUser properties undefined");
  }
  if (commentingUser.Slack_Name === undefined
    || slackUser.Slack_Id === undefined) {
    throw new Error("commentingUser properties undefined");
  }

  // Determine desc if sender & owner are different or same
  let desc;
  if (slackUser.Slack_Name === commentingUser.Slack_Name) {
    desc = `${slackUser.Slack_Name} has commented on this PR`;
  }
  else {
    desc = `${commentingUser.Slack_Name} has commented on this PR. Owner: ${slackUser.Slack_Id}`;
  }

  return desc;
}
