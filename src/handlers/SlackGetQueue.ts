import * as querystring from "querystring";
import { newLogger } from "../logger";
import { requiredEnvs } from "../required-envs";
import { XRayInitializer } from "../xray";
import { getSlackUserAlt } from "src/json/parse";
import { json } from "../json/src/json";

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
  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackGetQueue",
  });

  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  const success = {
    body: "GET QUEUE",
    statusCode: "200",
  };
  callback(null, success);
}
