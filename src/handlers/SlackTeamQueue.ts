import * as querystring from "querystring";
import { requiredEnvs } from "../required-envs";
import { newLogger } from "../logger";
import { XRayInitializer } from "../xray";
import { getSlackUserAlt } from "../json/parse";
import { json } from "../json/src/json";

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

export function processTeamQueue(
  event: any,
  context: any,
  callback: any,
): void {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SlackTeamQueue",
  });

  logger.info(`event: ${JSON.stringify(event)}`);

  const body = querystring.parse(event.body);
  logger.info(`event.body: ${JSON.stringify(body)}`);

  // Verify user_id property is not malformed
  if (body.user_id === undefined) {
    throw new Error("body.user_id not attched to request");
  }
  if (typeof body.user_id === "object") {
    throw new Error("body.user_id sent as an object rather than a string");
  }
  const slackUserID = `<@${body.user_id}>`;
  const slackUser = getSlackUserAlt(slackUserID, json);

  const success  = {
    body: "TEAM SUCCESS FOR <@UB5EWEB3M>",
    statusCode: "200",
  };
  callback(null, success);
}
