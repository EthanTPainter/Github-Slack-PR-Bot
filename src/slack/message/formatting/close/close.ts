
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
  if (slackUser === "") {
    throw new Error("No slackUser provided");
  }
  if (slackUserClosing === "") {
    throw new Error("No slackUserClosing provided");
  }
  const desc: string = `${slackUserClosing} closed this PR. Owner: @${slackUser}`;
  return desc;
}
