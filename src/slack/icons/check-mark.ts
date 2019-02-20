import { SlackUser } from "../../models";
import { getTeamOptions, getTeamOptionsAlt } from "../../json/parse";

/**
 * @description From github user, get check mark
 *        text for slack message check mark icon
 * @param githubUser string of the github username
 * @param json JSON config file
 * @returns check mark associated with the github
 *          user's team
 */
export function getCheckMark(
  githubUser: string,
  json: any,
): string {

  const options = getTeamOptions(githubUser, json);
  if (options.Check_Mark_Text === undefined) {
    throw new Error("Options.Check_Mark_Text is undefined");
  }

  return options.Check_Mark_Text;
}

/**
 * @description From slack user, get check mark
 *        text for slack message check mark icon
 * @param slackUser Slack user with name and id
 * @param json JSON config file
 * @returns Check mark associated with the slack
 *          user's team
 */
export function getCheckMarkAlt(
  slackUser: SlackUser,
  json: any,
): string {

  const options = getTeamOptionsAlt(slackUser, json);
  if (options.Check_Mark_Text === undefined) {
    throw new Error("Options.Check_Mark_Text is undefined");
  }

  return options.Check_Mark_Text;
}
