import { constructSlackMessage } from "../slack/message/construct/constructor";
import { json } from "../json/src/json";
import { requiredEnvs } from "../required-envs";
import { postMessage } from "../slack/api";
import { newLogger } from "../logger";
import { getTeamName, getTeamOptions } from "../json/parse";
import { getOwner } from "../github/parse";
import { updateDynamo } from "../dynamo/update";
import { XRayInitializer } from "../xray";
import {
  SQSRecord,
  SNSMessage,
  Callback,
  Context,
} from "aws-lambda";
import {
  getQueue,
  getMyQueue,
  processFixedPR,
  getTeamQueue,
} from "./helpers";

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
export async function processGitHubEvent(
  event: AWSLambda.SQSEvent,
  context: Context,
  callback: Callback,
): Promise<any> {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: `GitHub-Slack-PR-Bot`,
    service: `GitHubSlackManager`,
  });

  // Create an array of SQSEvent messages to process
  const messages = event.Records.map((record: SQSRecord) => {
    const parsedBody: SNSMessage = JSON.parse(record.body);
    return JSON.parse(parsedBody.Message);
  });
  logger.debug(`Messages: ${JSON.stringify(messages)}`);

  // Map through messages to process
  await messages.map(async (message) => {
    if (message["custom-source"] === "SLACK") {
      // Determine which slash command was used
      switch (message.command) {
        case "/sns":
          break;
        case "/team-queue":
          await getTeamQueue(message);
          break;
        case "/my-queue":
          await getMyQueue(message);
          break;
        case "/get-queue":
          await getQueue(message);
          break;
        case "/fixed-pr":
          await processFixedPR(message);
          break;
      }
    }
    else if (message["custom-source"] === "GITHUB") {
      const pullRequestAction: string = message.action;

      // Construct the Slack message based on PR action and body
      const slackMessage = await constructSlackMessage(pullRequestAction, message, json);

      // Determine which team the user belongs to
      const githubUser = getOwner(event);
      const teamName = getTeamName(githubUser, json);

      // Check whether to disable dynamo
      const teamOptions = getTeamOptions(githubUser, json);
      if (teamOptions.Disable_Dynamo === false) {
        // Update DynamoDB with new request
        await updateDynamo(githubUser, event, json, pullRequestAction);
      }

      // Use team name to get channel name and slack token from required Envs
      logger.info("Posting slack message to " + requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]);
      await postMessage(requiredEnvs.SLACK_API_URI,
        requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
        requiredEnvs[teamName + "_SLACK_TOKEN"],
        slackMessage);
    }
    else {
      // This should never happen since the application controls
      // the custom-source property.
      logger.error("custom-source not set to Slack or GitHub");
    }
  });
}
