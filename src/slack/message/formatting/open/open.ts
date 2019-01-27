/**
 * @author Ethan T Painter
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @returns String of the description for the slack message
 */
export function constructOpenDesc(slackUser: string,
                                  slackGroup: string,
                                  newPR: boolean,
                                 ): string {
  // The *...* style means the ... is BOLD in Slack
  if (slackUser === "") {
    throw new Error("No slackUser provided");
  }
  let desc: string = "";
  // new PR check
  if (newPR) {
    desc = `${slackUser} opened this PR. Needs *peer* and *lead* reviews`;
  } else {
    desc =   `${slackUser} reopened this PR. Needs *peer* and *lead* reviews`;
  }
  // Add SlackGroup
  if (slackGroup !== "") {
    desc = desc + ` @${slackGroup}`;
  }
  return desc;
}
