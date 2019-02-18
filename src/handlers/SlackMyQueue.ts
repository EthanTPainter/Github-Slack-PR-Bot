import * as querystring from "querystring";

import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";
import { getSlackUserAlt } from "../json/parse";
import { json } from "../json/src/json";
import { DynamoGet } from "../dynamo/api";

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

  logger.info(`event: ${JSON.stringify(event)}`);

  // X-Ray
  if (requiredEnvs.DISABLE_XRAY) {
    logger.info("Running with X-Ray disabled");
  } else {
    logger.info("Running with X-Ray enabled");
    const ann = new Annotations(
      "GitHub-Slack-PR-Bot",
      "SlackMyQueue",
    );
    AWSXRay.captureFunc(ann.application, (subsegment: any) => {
      subsegment.addAnnotation("application", ann.application);
      subsegment.addAnnotation("service", ann.service);
    });
  }

  // Convert x-www-urlencoded string to JSON notation
  // body using RequestBody notation
  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  // Verify user_id property is not malformed
  if (body.user_id === undefined) {
    throw new Error("body.user_id not attched to request");
  }
  if (typeof body.user_id === "object") {
    throw new Error("body.user_id sent as an object rather than a string");
  }

  // Format Slack User ID & retrieve queue
  const dynamoGet = new DynamoGet();
  // const slackUserID = `<@${body.user_id}>`;
  // const slackUser = getSlackUserAlt(slackUserID, json);
  const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };
  try {
    const userQueue = await dynamoGet.getItem(slackUser);
    logger.info(userQueue!);

    const success: object = {
      body: "MY SUCCESS \n" + JSON.stringify(userQueue),
      statusCode: "200",
    };
    callback(null, success);
  }
  catch (error) {
    logger.error("Uh oh. Error occurred: " + error.message);
  }
}
