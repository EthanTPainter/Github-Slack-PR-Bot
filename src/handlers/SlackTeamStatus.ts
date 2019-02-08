import * as querystring from "querystring";

import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackTeamStatus");

/**
 * This handler:
 * 1) Receives messages from Slack users sent to the Slack Bot,
 *    and responds with expected information from Dynamo
 *
 * Slack Events API for Slack messaging with Bots
 * https://api.slack.com/events-api
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
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
