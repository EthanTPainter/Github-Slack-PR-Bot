import * as querystring from "querystring";

import { getSlackGroupAlt } from "../json/parse";
import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";
import { json } from "../json/src/json";
import { formatQueue } from "../dynamo/formatting/queue";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackTeamStatus");

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

export function handler(
  event: any,
  context: any,
  callback: any,
): void {

  logger.info(`event: ${JSON.stringify(event)}`);

  // X-Ray
  if (requiredEnvs.DISABLE_XRAY) {
    logger.info("Running with X-Ray disabled");
  } else {
    logger.info("Running with X-Ray enabled");
    const ann = new Annotations(
      "GitHub-Slack-PR-Bot",
      "SlackTeamStatus",
    );
    AWSXRay.captureFunc(ann.application, (subsegment: any) => {
      subsegment.addAnnotation("application", ann.application);
      subsegment.addAnnotation("service", ann.service);
    });
  }

  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  // Verify user_id property is not malformed
  if (body.user_id === undefined) {
    throw new Error("body.user_id not attched to request");
  }
  if (typeof body.user_id === "object") {
    throw new Error("body.user_id sent as an object rather than a string");
  }
  const slackUserID = body.user_id;
  // const slackGroupName = getSlackGroupAlt(slackUserID, json);
  // const formattedMessage = formatQueue();

  const success: object = {
    body: "TEAM SUCCESS FOR <@UB5EWEB3M>",
    statusCode: "200",
  };
  callback(null, success);
}
