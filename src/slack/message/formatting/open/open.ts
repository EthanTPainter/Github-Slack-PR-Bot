/**
 * @author Ethan T Painter
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @returns String of the description for the slack message
 */
export function constructOpenDesc(slackUser: string,
                                  slackGroup ?: string,
                                ): string {
  // The *...* style means the ... is BOLD in Slack
  let desc: string = `@${slackUser} opened this PR. Needs *peer* and *lead* reviews`;
  if (slackGroup !== "") {
    desc = desc + ` @${slackGroup}`;
  }
  return desc;
}
