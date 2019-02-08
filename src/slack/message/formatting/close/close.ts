import { SlackUser } from "../../../../models";

/**
 * @author Ethan T Painter
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @returns String of the description for the slack message
 */
export function constructCloseDesc(slackUser: SlackUser,
                                   slackUserClosing: SlackUser,
                                  ): string {
  // Safety checks
  if (slackUser.Slack_Name === undefined) {
    throw new Error("slackUser.Slack_Name is undefined");
  }
  if (slackUserClosing.Slack_Name === undefined) {
    throw new Error("slackUserClosing.Slack_Name is undefined");
  }

  let desc: string = "";
  // If slackUser and slackUserClosing is the same user
  if (slackUser === slackUserClosing) {
    desc = `${slackUser.Slack_Name} closed this PR.`;
  }
  else {
    desc = `${slackUserClosing.Slack_Name} closed this PR. Owner: ${slackUser.Slack_Id}`;
  }
  return desc;
}
