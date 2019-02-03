import * as rp from "request-promise";
import { newLogger } from "../../logger";

const logger = newLogger("PostEphemeral");

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

  logger.info("Options: " + JSON.stringify(options));

  const result = await rp(options);
  return result;
}
