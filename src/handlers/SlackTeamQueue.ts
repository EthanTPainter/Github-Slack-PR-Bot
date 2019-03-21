import * as querystring from "querystring";
import { requiredEnvs } from "../required-envs";
import { newLogger } from "../logger";
import { XRayInitializer } from "../xray";
import { json } from "../json/src/json";
import { DynamoGet } from "../dynamo/api";
import { formatTeamQueue } from "../dynamo/formatting";
import { getSlackGroupAlt } from "../json/parse";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackTeamQueue");

/**
 * This handler:
 * 1) Receives POST request from Slack after the
 *    '/team-queue' command has been used
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 * @returns Current team queue
 */

export async function processTeamQueue(
  event: any,
  context: any,
  callback: any,
): Promise<void> {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackTeamQueue",
  });

  logger.info(`event: ${JSON.stringify(event)}`);

  // Convert x-www-urlencoded string to JSON notation
  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  // Verify user_id property is not missing
  const userId = body.user_id;
  if (!userId) {
    throw new Error("body.user_id not attached to request");
  }
  if (typeof userId === "object") {
    throw new Error(`body.user_id sent as an object rather than a string`);
  }

  // Format Slack User Id & get Slack User
  const dynamoGet = new DynamoGet();
  const slackUserID = `<@${body.user_id}>`;
  logger.info(`slackUserId: ${slackUserID}`);

  try {
    // Get Team Queue
    const teamName = getSlackGroupAlt(slackUserID, json);
    logger.info(`team details: ${JSON.stringify(teamName)}`);

    const teamQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      teamName.Slack_Id);
    logger.info(`Team Queue: ${JSON.stringify(teamQueue)}`);

    // Format queue from array to string
    const formattedQueue = formatTeamQueue(teamQueue, json);

    const success = {
      body: formattedQueue,
      statusCode: "200",
    };
    callback(null, success);
  }
  catch (error) {
    // Error encountered. Let the user know in Slack
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    const slackError = {
      body : errorMessage,
      statusCode: 200,
    };
    callback(null, slackError);
  }
}
