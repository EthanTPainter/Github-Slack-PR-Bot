/**
 * @author Ethan T Painter
 * @description Construct description when a user requests changes
 * @param slackUser Slack user who owns the PR
 * @param SlackUserRequesting Slack user who is requesting PR changes
 * @returns String of the description
 */
export function constructReqChangesDesc(slackUser: string,
                                        slackUserRequesting: string,
                                      ): string {
  const desc: string = `@${slackUserRequesting} is requesting changes to this PR. (Owner: @${slackUser})`;
  return desc;
}
