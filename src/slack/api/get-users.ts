import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("GetUsers");

/**
 * @author Ethan T Painter
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
      Authorization: `Bearer ${token}`,
    },
    json: true,
    method: "POST",
    uri: `${slackApiUri}/users.list`,
  };

  logger.debug("Options: " + JSON.stringify(options));

  const result = await rp(options);
  return result;
}
