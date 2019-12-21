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
  slackToken: string,
  message: string,
): Promise<any> {

  const options = {
    body: {
      channel: channel,
      token: slackToken,
      text: message,
      user: user,
      as_user: true,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${slackToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    json: true,
    method: "POST",
    uri: `${slackApiUri}/chat.postEphemeral`,
  };

  logger.info(`Sending message to slack user`);
  const result = await rp(options);
  return result;
}
