import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("PostEphemeral");

/**
 * @description Post an ephemeral message
 * @param slackApiUri Base Slack API Uri
 * @param user User to send the message to
 * @param channel Slack channel
 * @param token Slack Token
 * @param message Slack message
 * @param attachment Attachments for slack messages
 */
export async function postEphemeral(
  slackApiUri: string,
  user: string,
  channel: string,
  token: string,
  message: string,
): Promise<any> {

  const options = {
    body: {
      channel: channel,
      token: token,
      text: message,
      user: user,
      as_user: true,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    json: true,
    method: "POST",
    uri: `${slackApiUri}/chat.postEphemeral`,
  };

  const result = await rp(options);
  return result;
}
