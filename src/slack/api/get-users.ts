import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("GetUsers");

/**
 * @description Get list of users in an org
 * @param slackApiUri Base Slack API Uri
 * @param token Slack Token
 */
export async function getUsers(
  slackApiUri: string,
  token: string,
): Promise<any> {

  const options = {
    body: {
      token: token,
    },
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    json: true,
    method: "POST",
    uri: `${slackApiUri}/users.list`,
  };

  logger.info(`Retrieving users from Slack Organization`);
  const result = await rp(options);
  return result;
}
