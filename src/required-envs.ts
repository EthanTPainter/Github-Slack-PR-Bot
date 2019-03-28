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
  DYNAMO_TABLE_NAME: string;
  DYNAMO_API_VERSION: string;
  DYNAMO_REGION: string;
  SNS_ARN: string;
  SNS_API_VERSION: string;
  SQS_ARN: string;
  SQS_API_VERSION: string;
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: string;
  INTEGRATION_TEST_SLACK_CHANNEL_NAME: string;
}

export const requiredEnvs = envalid.cleanEnv<EnvModel>(process.env, {
  DISABLE_XRAY: bool({ default: false }),
  GITHUB_OAUTH2_TOKEN: str(),
  SLACK_API_URI: str({ default: "https://slack.com/api" }),
  DEV_TEAM_1_SLACK_CHANNEL_NAME: str(),
  DEV_TEAM_1_SLACK_TOKEN: str(),
  DYNAMO_TABLE_NAME: str({ default: "pr-bot-table" }),
  DYNAMO_API_VERSION: str({ default: "2012-08-10"}),
  DYNAMO_REGION: str({ default: "us-east-1" }),
  SNS_ARN: str(),
  SNS_API_VERSION: str({ default: "2010-03-31" }),
  SQS_ARN: str(),
  SQS_API_VERSION: str({ default: "2012-11-05" }),
  INTEGRATION_TEST_DYNAMO_TABLE_NAME: str({ default: "pr-bot-table-test" }),
  INTEGRATION_TEST_SLACK_CHANNEL_NAME: str({ default: "#message-tester" }),
}, {
  strict: true,
});
