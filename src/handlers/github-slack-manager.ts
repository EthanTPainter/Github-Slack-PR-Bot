import { constructSlackMessage } from "../slack/message/construct/constructor";
import { json } from "../json/src/json";
import { requiredEnvs } from "../required-envs";
import { postMessage, postEphemeral } from "../slack/api";
import { newLogger } from "../logger";
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
  myQueue,
  processFixedPR,
  getTeamQueue,
} from "./helpers";
import {
  getTeamName,
  getTeamOptions,
  getTeamOptionsAlt,
  getSlackUserAlt,
} from "../json/parse";

import { SlashResponse } from "../models";

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
): Promise<void> {

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
  const messageRequests = messages.map(async (message) => {
    if (message.custom_source === "SLACK") {
      // Determine which slash command was used & store result of processing
      let response: SlashResponse;
      switch (message.command) {
        case "/sns":
          return;
        case "/echo":
          response = {
            body: "Slash command /echo received!",
            statusCode: 200,
          };
          break;
        case "/team-queue":
          response = await getTeamQueue(message);
          break;
        case "/my-queue":
          response = await myQueue(message);
          break;
        case "/get-queue":
          response = await getQueue(message);
          break;
        case "/fixed-pr":
          response = await processFixedPR(message);
          return;
        default:
          response = {
            body: "Unsupported slash command. See README for supported commands",
            statusCode: 200,
          };
          break;
      }
      const slackUserId = `<@${message.user_id}>`;
      const slackUser = getSlackUserAlt(slackUserId, json);
      const teamOptions = getTeamOptionsAlt(slackUser, json);
      if (teamOptions.Disable_Dynamo === false) {
        logger.info(`Sending message to ${message.user_id}`);
        await postEphemeral(
          requiredEnvs.SLACK_API_URI,
          message.user_id,
          message.channel_id,
          requiredEnvs.SLACK_BOT_TOKEN,
          response.body);
      }
      return;
    }
    else if (message.custom_source === "GITHUB") {
      const pullRequestAction: string = message.action;

      // Construct the Slack message based on PR action and body
      const slackMessage = await constructSlackMessage(pullRequestAction, message, json);

      // Determine which team the user belongs to
      const githubUser = getOwner(event);
      const teamName = getTeamName(githubUser, json);
      const teamOptions = getTeamOptions(githubUser, json);

      // Check whether to disable dynamo
      let alertSlack = true;
      if (teamOptions.Disable_Dynamo === false) {
        // Update DynamoDB with new request
        alertSlack = await updateDynamo(githubUser, event, json, pullRequestAction);
      }

      // Check whether to disable github-to-slack notifications
      if (teamOptions.Disable_GitHub_Alerts === false && alertSlack) {
        // Verify team name required envs exist
        if (!requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]) {
          logger.error(`Expected environment variable not found: ${teamName}_SLACK_CHANNEL_NAME`);
          return;
        }
        // Use team name to get channel name and slack token from required Envs
        logger.info("Posting slack message to " + requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]);
        await postMessage(
          requiredEnvs.SLACK_API_URI,
          requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
          requiredEnvs.SLACK_BOT_TOKEN,
          slackMessage);
      }
      return;
    }
    else {
      // This should never happen since the application controls
      // the custom-source property.
      logger.info(`Recieved Uknown Event: ${JSON.stringify(message)}`);
      logger.error("Message property custom_source not set to Slack or GitHub");
      return;
    }
  });
  await Promise.all(messageRequests);
}
