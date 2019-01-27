import { postMessage } from "../../api/post-message";

/**
 * @author Ethan T Painter
 * @description post message to Slack Channel
 * @param slackApiUri The URL for Slack API
 * @param channel Slack Channel
 * @param token Slack Token
 * @param message Slack message to send to the channel
 * @returns Response from postMessage
 */
export function setupSlackPost(slackApiUri: string,
                               channel: string,
                               token: string,
                               message: string,
                           ): any {
  const postToChannel: any = postMessage(
    slackApiUri,
    { channel, token },
  );

  return postToChannel(message);
}
