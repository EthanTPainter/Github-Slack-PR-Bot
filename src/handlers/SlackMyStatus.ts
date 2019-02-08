import * as querystring from "querystring";

import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";
import { getSlackGroupAlt } from "../json/parse";
import { json } from "../json/src/json";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackMyStatus");

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
      "SlackMyStatus",
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
  const slackUserID = body.user_id;

  const success: object = {
    body: "MY SUCCESS",
    statusCode: "200",
  };
  callback(null, success);
}
