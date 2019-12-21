import dotenv = require("dotenv");
dotenv.config();

import * as envalid from "envalid";
const { bool, str } = envalid;

export class EnvModel {
  LOG_LEVEL: string;
  GITHUB_OAUTH_TOKEN_SSM_PARAM: string;
  SLACK_BOT_TOKEN_SSM_PARAM: string;
  SLACK_API_URI: string;
  DYNAMO_TABLE_NAME: string;
  DYNAMO_API_VERSION: string;
  DYNAMO_REGION: string;
  SQS_URL: string;
  SQS_API_VERSION: string;
  SSM_API_VERSION: string;
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: string;
  SCRIPTER_SLACK_CHANNEL_NAME: string;
  CONNECT_SLACK_CHANNEL_NAME: string;
  /* Add Your Team Name following the format:
  * [TEAM NAME]_SLACK_CHANNEL_NAME: string;
  */
}

export const requiredEnvs = envalid.cleanEnv<EnvModel>(process.env, {
  LOG_LEVEL: str({ default: "debug" }),
  GITHUB_OAUTH_TOKEN_SSM_PARAM: str({ default: "/dev-pr-bot/slack-bot-token" }),
  SLACK_BOT_TOKEN_SSM_PARAM: str({ default: "/dev-pr-bot/github-token" }),
  SLACK_API_URI: str({ default: "https://slack.com/api" }),
  DYNAMO_TABLE_NAME: str({ default: "pr-bot-table" }),
  DYNAMO_API_VERSION: str({ default: "2012-08-10"}),
  DYNAMO_REGION: str({ default: "us-east-1" }),
  SQS_URL: str(),
  SQS_API_VERSION: str({ default: "2012-11-05" }),
  SSM_API_VERSION: str({ default: "2014-11-06" }),
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: str({ default: "pr-bot-test-table" }),
  SCRIPTER_SLACK_CHANNEL_NAME: str(),
  CONNECT_SLACK_CHANNEL_NAME: str(),
  /* Add Your Team Name following the format:
  * [TEAM NAME]_SLACK_CHANNEL_NAME: str(),
  */
}, {
  strict: true,
});
