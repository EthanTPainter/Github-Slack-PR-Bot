import * as rp from "request-promise";

/**
 * @author Ethan T Painter
 * @description post message to Slack Channel
 * @param slackApiUri The URL for Slack API
 * @param channel Slack Channel
 * @param token Slack Token
 * @param message Slack message to send to the channel
 * @param attachment Slack attachment text
 * @returns Response from making request to Slack
 */
export async function postMessage(slackApiUri: string,
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

  const result = await rp(options);
  return result;
}
