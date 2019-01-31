import * as rp from "request-promise";

export async function postEphemeral(slackApiUri: string,
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
    uri: `${slackApiUri}/chat.postEphemeral`,
  };

  const result = await rp(options);
  return result;
}
