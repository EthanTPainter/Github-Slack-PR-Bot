import * as querystring from "querystring";

import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";

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

  const success: object = {
    body: "TEAM SUCCESS FOR <subteam here>",
    statusCode: "200",
  };
  callback(null, success);
}
