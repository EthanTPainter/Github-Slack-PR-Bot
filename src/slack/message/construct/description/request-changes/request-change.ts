import { SlackUser } from "../../../../../models";

/**
 * @description Construct description when a user requests changes
 * @param slackUser Slack user who owns the PR
 * @param SlackUserRequesting Slack user who is requesting PR changes
 * @returns String of the description
 */
export function constructReqChangesDesc(
  slackUser: SlackUser,
  slackUserRequestingChanges: SlackUser,
): string {

  // Error handling
  if (slackUser.Slack_Name === undefined
    || slackUser.Slack_Id === undefined) {
      throw new Error("slackUser properties undefined");
  }
  if (slackUserRequestingChanges.Slack_Name === undefined
    || slackUserRequestingChanges.Slack_Id === undefined) {
      throw new Error("slackUserRequestingChanges properties undefined");
  }

  const desc = `${slackUserRequestingChanges.Slack_Name} requested changes to this PR.`
    + ` Owner: ${slackUser.Slack_Id}`;
  return desc;
}
