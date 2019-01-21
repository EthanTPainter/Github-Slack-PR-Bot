import dotenv = require("dotenv");
dotenv.config();

import * as envalid from "envalid";
const { str } = envalid;

export class ConfigModel {
  GITHUB_OAUTH2_TOKEN: string;
  SLACK_CHANNEL_NAME: string;
  SLACK_API_URI: string;
  SLACK_TOKEN: string;
}

export const config = envalid.cleanEnv<ConfigModel>(process.env, {
  GITHUB_OAUTH2_TOKEN: str(),
  SLACK_CHANNEL_NAME: str(),
  SLACK_API_URI: str(),
  SLACK_TOKEN: str(),
}, {
  strict: true,
});
