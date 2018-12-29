import * as rp from "request-promise";

export const setupSlackPost: any = (uri: string, slackConfig: any): any => {
  const baseOptions: any = {
    body: slackConfig,
    headers: {
      Authorization: `Bearer ${slackConfig.token}`,
    },
    json: true,
    method: "POST",
    uri: `${uri}/chat.postMessage`,
  };

  return (text: string): any => {
    const optionsWithMessage: any = Object.assign(
      {},
      baseOptions,
      { body: {
          ...slackConfig,
          as_user: true,
          text,
        },
      },
    );

    console.log(optionsWithMessage);

    return rp(optionsWithMessage)
      .then((resp: any) => {
        return resp;
      })
      .catch((err: any) => {
        return Promise.reject(err);
      });
  };
};
