import * as querystring from "querystring";
import { newLogger } from "../logger";
import { requiredEnvs } from "../required-envs";
import { XRayInitializer } from "../xray";
import { DynamoGet } from "src/dynamo/api";
import { formatMyQueue } from "../dynamo/formatting";
import { json } from "../json/src/json";

const AWSXray = require("aws-xray-sdk");
AWSXray.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackGetQueue");

export async function processGetQueue(
  event: any,
  context: any,
  callback: any,
): Promise<void> {

  logger.info(`event: ${JSON.stringify(event)}`);

  // X-Ray
  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackGetQueue",
  });

  try {

    const body = querystring.parse(event.body);
    if (body.user_id === undefined) {
      throw new Error("body.user_id is not attached to request");
    }

    // Format slack user id & get slack user queue
    const dynamoGet = new DynamoGet();
    const slackUserId = `<@${body.user_id}>`;

    // Get user's queue
    const userQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      slackUserId);

    // Format the user queue
    const formattedQueue = formatMyQueue(userQueue, json);

    const success = {
      body: formattedQueue,
      statusCode: "200",
    };
    callback(null, success);
  }
  catch (error) {
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    const fail  = {
      body: errorMessage,
      statusCode: 200,
    };
    callback(null, fail);
  }
}
