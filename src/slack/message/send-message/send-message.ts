import { setupSlackPost } from "../../api/slack";

export const postMessage: any = (
  slackApiUri: string,
  channel: string,
  token: string,
  message: string,
): any => {
  const postToChannel: any = setupSlackPost(
    slackApiUri,
    { channel, token },
  );

  return postToChannel(message);
};
