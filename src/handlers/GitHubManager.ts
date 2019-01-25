import { constructSlackMessage } from "../slack/message/construct/constructor";
import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

/**
 * This handler does 2 things:
 * 1) Receives webhook POST requests from GitHub repositories
 *    && constructs slack messages to post in team slack channels
 * 2) Receives messages from Slack users sent to the Slack Bot,
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

  // If Running locally
  if (requiredEnvs.DISABLE_XRAY) {
    console.log("Running with X-Ray disabled");
  } else {
    console.log("Running with X-Ray enabled");
    const ann = new Annotations(
      "GitHub-Slack-PR-Bot",
      "SlackManager",
    );
    AWSXRay.captureFunc(ann.application, (subsegment: any) => {
      subsegment.addAnnotation("application", ann.application);
      subsegment.addAnnotation("service", ann.service);
    });
  }
  console.log(`Event: ${JSON.stringify(event)}`);

  // Grab body from event
  const body: any = JSON.parse(event.body);
  console.log(`Event body: ${JSON.stringify(body)}`);

  // Use action property to format the response
  const pullRequestAction: string = body.action;
  console.log(`Action Found: ${pullRequestAction}`);

  // Construct the Slack message based on PR action and body
  const slackMessage: string = constructSlackMessage(pullRequestAction, body);

  // Provide success statusCode/Message
  const success: object = {
    body: "Successfully retrieved event",
    statusCode: "200",
  };
  callback(null, success);
}
