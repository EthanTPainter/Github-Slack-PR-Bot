
/**
 * @author Ethan T Painter
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @returns String of the description for the slack message
 */
export function constructCloseDesc(slackUser: string,
                                   slackUserClosing: string,
                                  ): string {
  // Safety checks
  if (slackUser === "") {
    throw new Error("No slackUser provided");
  }
  if (slackUserClosing === "") {
    throw new Error("No slackUserClosing provided");
  }
  let desc: string = "";
  // If slackUser and slackUserClosing is the
  // same user
  if (slackUser === slackUserClosing) {
    desc = `${slackUser} closed this PR.`;
  }
  else {
    desc = `${slackUserClosing} closed this PR. Owner: @${slackUser}`;
  }
  return desc;
}
