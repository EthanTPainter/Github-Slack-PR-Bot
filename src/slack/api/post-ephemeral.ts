import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("PostEphemeral");

/**
 * @description Post an ephemeral message
 * @param slackApiUri Base Slack API Uri
 * @param channel Slack channel
 * @param token Slack Token
 * @param message Slack message
 * @param attachment Attachments for slack messages
 */
export async function postEphemeral(
  slackApiUri: string,
  channel: string,
  token: string,
  message: string,
  attachment?: string,
): Promise<any> {

  const options = {
    body: {
      channel: channel,
      token: token,
      text: message,
      as_user: true,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    json: true,
    method: "POST",
    uri: `${slackApiUri}/chat.postEphemeral`,
  };

  logger.info("Options: " + JSON.stringify(options));

  const result = await rp(options);
  return result;
}
