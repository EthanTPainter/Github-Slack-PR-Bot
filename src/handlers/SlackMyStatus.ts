import * as querystring from "querystring";

import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { newLogger } from "../logger";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackMyStatus");

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
  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  const success: object = {
    body: "MY SUCCESS",
    statusCode: "200",
  };
  callback(null, success);
}
