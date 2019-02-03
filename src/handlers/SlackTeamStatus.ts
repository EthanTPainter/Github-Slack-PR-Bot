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

  // X-Ray
  // Locally - Disable unless using xray daemon locally
  // Dpeloyed - Enable
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

  logger.info(`Event: ${JSON.stringify(event)}`);

  // Grab body from event
  const body: any = JSON.parse(event.body);
  logger.debug(`Event body: ${JSON.stringify(body)}`);

  logger.info("Nothing yet");

  // URL Verfication for connecting Slack bots
  if (body.challenge !== undefined) {
    const challenge = body.challenge;
    // Provide success statusCode/Message
    const success: object = {
      body: challenge,
      statusCode: "200",
    };
    callback(null, success);
  }
}
