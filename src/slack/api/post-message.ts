import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("PostMessage");

/**
 * @author Ethan T Painter
 * @description post message to Slack Channel
 * @param {string} slackApiUri The URL for Slack API
 * @param {string} channel Slack Channel
 * @param {string} token Slack Token
 * @param {string} message Slack message to send to the channel
 * @param {string?} attachment Slack attachment text
 * @returns Response from making request to Slack
 */
export async function postMessage(
  slackApiUri: string,
  channel: string,
  token: string,
  message: string,
  attachment?: string,
): Promise<any> {

  const options: any = {
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
    uri: `${slackApiUri}/chat.postMessage`,
  };

  logger.info("Options: " + JSON.stringify(options));

  const result = await rp(options);
  return result;
}
