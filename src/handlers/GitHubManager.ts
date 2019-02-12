import { constructSlackMessage } from "../slack/message/construct/constructor";
import { json } from "../json/src/json";
import { requiredEnvs } from "../required-envs";
import { Annotations } from "../models";
import { postMessage } from "../slack/api";
import { newLogger } from "../logger";
import { getTeamName} from "../json/parse";
import { getOwner } from "../github/parse";
import { updateDynamo } from "../dynamo/update";

const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

const logger = newLogger("GitHubManager");

/**
 * This handler:
 * 1) Receives webhook POST requests from GitHub repositories
 *    && constructs slack messages to post in team slack channels
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 * @returns Slack message to team slack channel about the event that occurred
 */
export async function handler(
  event: any,
  context: any,
  callback: any,
): Promise<any> {

  // X-Ray
  if (requiredEnvs.DISABLE_XRAY) {
    logger.info("Running with X-Ray disabled");
  } else {
    logger.info("Running with X-Ray enabled");
    const ann = new Annotations(
      "GitHub-Slack-PR-Bot",
      "GitHubManager",
    );
    AWSXRay.captureFunc(ann.application, (subsegment: any) => {
      subsegment.addAnnotation("application", ann.application);
      subsegment.addAnnotation("service", ann.service);
    });
  }

  logger.info(`Event: ${JSON.stringify(event)}`);

  // Grab body from event
  const body = JSON.parse(event.body);
  logger.debug(`Event body: ${JSON.stringify(body)}`);

  // Use action property to format the response
  const pullRequestAction: string = body.action;

  // Construct the Slack message based on PR action and body
  logger.info(`Constructing slack message using action (${pullRequestAction})`);
  const slackMessage = await constructSlackMessage(pullRequestAction, body, json);
  logger.debug("Slack Message created:\n" + slackMessage);

  // Determine which sub team the user belongs to
  const githubUser = getOwner(event);
  const teamName = getTeamName(githubUser, json);

  // Update DynamoDB with new request
  logger.info("Updating DynamoDB table");
  await updateDynamo(githubUser, event, json, pullRequestAction);

  // Use team name to get channel name and slack token from required Envs
  logger.info("Posting slack message to " + requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]);
  await postMessage(requiredEnvs.SLACK_API_URI,
                    requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
                    requiredEnvs[teamName + "_SLACK_TOKEN"],
                    slackMessage);

  // Provide success statusCode/Message
  const success: object = {
    body: "Successfully retrieved event",
    statusCode: "200",
  };
  callback(null, success);
}
