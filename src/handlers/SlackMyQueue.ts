import * as querystring from "querystring";
import { requiredEnvs } from "../required-envs";
import { PullRequest } from "../models";
import { newLogger } from "../logger";
import { json } from "../json/src/json";
import { DynamoGet } from "../dynamo/api";
import { formatMyQueue } from "../dynamo/formatting";
import { XRayInitializer } from "../xray";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackMyQueue");

/**
 * This handler:
 * 1) Receives POST request from Slack after the
 *    '/my-queue' command has been used
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if
 *                 successfull or failed
 * @returns Current queue for requested user
 */
export async function processMyQueue(
  event: any,
  context: any,
  callback: any,
): Promise<void> {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackMyQueue",
  });

  logger.info(`event: ${JSON.stringify(event)}`);

  // Convert x-www-urlencoded string to JSON notation
  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  // Verify user_id property is not malformed
  if (body.user_id === undefined) {
    throw new Error("body.user_id not attched to request");
  }

  // Format Slack User ID & get Slack User
  const dynamoGet = new DynamoGet();
  const slackUserId = `<@${body.user_id}>`;

  try {
    // Get User Queue
    const userQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      slackUserId);
    logger.info(`User Queue: ${userQueue}`);

    // Format queue from array to string
    const formattedQueue = formatMyQueue(userQueue, json);

    const success = {
      body: formattedQueue,
      statusCode: "200",
    };
    callback(null, success);
  }
  catch (error) {
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    const fail = {
      body: errorMessage,
      statusCode: 200,
    };
    callback(null, fail);
  }
}
