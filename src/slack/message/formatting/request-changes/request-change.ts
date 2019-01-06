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
  if (slackUser === "") {
    throw new Error("No slackUser provided");
  }
  if (slackUserRequesting === "") {
    throw new Error("No slackUserRequesting provided");
  }
  const desc: string = `${slackUserRequesting} is requesting changes to this PR. Owner: @${slackUser}`;
  return desc;
}
