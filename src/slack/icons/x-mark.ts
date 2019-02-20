import { SlackUser } from "../../models";
import { getTeamOptions, getTeamOptionsAlt } from "../../json/parse";

/**
 * @description From github username, get check mark
 *        text for slack message check mark icon
 * @param githubUser string of the github username
 * @param json Config json file
 * @returns string of the Check mark text
 */
export function getXMark(
  githubUser: string,
  json: any,
): string {

  const options = getTeamOptions(githubUser, json);
  if (options.X_Mark_Text === undefined) {
    throw new Error("Options.X_Mark_Text is undefined");
  }

  return options.X_Mark_Text;
}

/**
 * @description From slack user, get x mark
 *        text for slack message x mark icon
 * @param slackUser Slack user of the
 * @param json JSON config file
 * @retuns string of the check mark text
 */
export function getXMarkAlt(
  slackUser: SlackUser,
  json: any,
): string {

  const options = getTeamOptionsAlt(slackUser, json);
  if (options.X_Mark_Text === undefined) {
    throw new Error("Options.X_Mark_Text is undefined");
  }

  return options.X_Mark_Text;
}
