import * as querystring from "querystring";
import { newLogger } from "../logger";
import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";

const AWSXray = require("aws-xray-sdk");
AWSXray.captureHTTPsGlobal(require("http"));

const logger = newLogger("SlackGetQueue");

export function processGetQueue(
  event: any,
  context: any,
  callback: any,
): void {

  logger.info(`event: ${JSON.stringify(event)}`);

  // X-Ray
  if (requiredEnvs.DISABLE_XRAY) {
    logger.info("Running with X-Ray disabled");
  }
  else {
    logger.info("Running with X-Ray enabled");
    const ann = new Annotations(
      "GitHub-Slack-PR-Bot",
      "SlackGetQueue",
    );
  }

  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);
}
