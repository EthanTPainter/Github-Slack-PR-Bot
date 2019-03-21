import * as querystring from "querystring";
import { newLogger } from "../logger";
import { XRayInitializer } from "../xray";
import { requiredEnvs } from "../required-envs";
import { DynamoGet } from "src/dynamo/api";
import { updateFixedPR } from "../dynamo/update";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackFixedPR");

export async function processFixedPR(
  event: any,
  context: any,
  callback: any,
): Promise<void> {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackFixedPR",
  });

  try {
    // Convert x-www-urlencoded string to JSON notation
    const body = querystring.parse(event.body);
    if (!body.user_id) {
      const invalidUserIdMessage = `Unable to determine which slack user sent this request`;
      const invalidResp = {
        body: invalidUserIdMessage,
        statusCode: 200,
      };
      callback(null, invalidResp);
    }

    // Format slack user id & get slack user
    const dynamoGet = new DynamoGet();
    const slackUserId = `<@${body.user_id}>`;

    // Get User's queue
    const userQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      slackUserId);

    // Get fixedPR url from slack text
    const text = event.text;
    if (!text) {
      const invalidTextMessage = `Couldn't find a valid GitHub PR Url after /fixed-pr slash command`;
      const invalidResp = {
        body: invalidTextMessage,
        statusCode: 200,
      };
      callback(200, invalidResp);
    }
    // Check for expected match
    const expression = "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\."
      + "[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^"
      + "\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})";
    const regex = new RegExp(expression);
    if (!text.match(regex)) {
      const invalidUrlMessage = `Invalid URL provided. Make sure to follow this format: `
        + `/fixed-pr https://www.github.com/org/repo/pull/###`;
      const invalidUrl = {
        body: invalidUrlMessage,
        statusCode: 200,
      };
      callback(null, invalidUrl);
    }

    // Process the PR now that it's fixed
    const slackMessage = await updateFixedPR(
      slackUserId,
      text,
      userQueue);

    const success = {
      body: slackMessage,
      statusCode: 200,
    };
    callback(null, success);
  }
  catch (error) {
    const errorMessage = `Uh oh. Erorr occurred: ${error.message}`;
    const fail = {
      body: errorMessage,
      statusCode: 200,
    };
    callback(null, fail);
  }
}
