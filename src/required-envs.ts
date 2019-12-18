import dotenv = require("dotenv");
dotenv.config();

import * as envalid from "envalid";
const { bool, str } = envalid;

export class EnvModel {
  LOG_LEVEL: string;
  GITHUB_OAUTH2_TOKEN: string;
  SLACK_API_URI: string;
  DYNAMO_TABLE_NAME: string;
  DYNAMO_API_VERSION: string;
  DYNAMO_REGION: string;
  SQS_URL: string;
  SQS_API_VERSION: string;
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: string;
  SLACK_BOT_TOKEN: string;
  /* Add Your Team Name following the format:
  * [TEAM NAME]_SLACK_CHANNEL_NAME: string;
  */
}

export const requiredEnvs = envalid.cleanEnv<EnvModel>(process.env, {
  LOG_LEVEL: str({ default: "debug" }),
  GITHUB_OAUTH2_TOKEN: str(),
  SLACK_API_URI: str({ default: "https://slack.com/api" }),
  DYNAMO_TABLE_NAME: str({ default: "pr-bot-table" }),
  DYNAMO_API_VERSION: str({ default: "2012-08-10"}),
  DYNAMO_REGION: str({ default: "us-east-1" }),
  SQS_URL: str(),
  SQS_API_VERSION: str({ default: "2012-11-05" }),
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: str({ default: "pr-bot-test-table" }),
  SLACK_BOT_TOKEN: str(),
  /* Add Your Team Name following the format:
  * [TEAM NAME]_SLACK_CHANNEL_NAME: str(),
  */
}, {
  strict: true,
});
