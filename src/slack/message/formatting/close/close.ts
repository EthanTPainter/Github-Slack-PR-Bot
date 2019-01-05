
/**
 * @author Ethan T Painter
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @returns String of the description for the slack message
 */
export function constructCloseDesc(slackUser: string,
                                   slackGroup ?: string,
                                  ): string {
  let desc: string = `@${slackUser} closed this PR.`;
  if (slackGroup !== "") {
    desc = desc + ` @${slackGroup}`;
  }
  return desc;
}
