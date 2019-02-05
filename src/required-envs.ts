import dotenv = require("dotenv");
dotenv.config();

import * as envalid from "envalid";
const { bool, str } = envalid;

export class EnvModel {
  DISABLE_XRAY: boolean;
  GITHUB_OAUTH2_TOKEN: string;
  SLACK_API_URI: string;
  DEV_TEAM_1_SLACK_CHANNEL_NAME: string;
  DEV_TEAM_1_SLACK_TOKEN: string;
  DYNAMO_TABLE: string;
  DYNAMO_API_VERSION: string;
  DYNAMO_REGION: string;
}

export const requiredEnvs = envalid.cleanEnv<EnvModel>(process.env, {
  DISABLE_XRAY: bool({ default: false }),
  GITHUB_OAUTH2_TOKEN: str(),
  SLACK_API_URI: str(),
  DEV_TEAM_1_SLACK_CHANNEL_NAME: str(),
  DEV_TEAM_1_SLACK_TOKEN: str(),
  DYNAMO_TABLE: str(),
  DYNAMO_API_VERSION: str(),
  DYNAMO_REGION: str(),
}, {
  strict: true,
});
