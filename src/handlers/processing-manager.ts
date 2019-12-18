import { constructSlackMessage } from "../slack/message/construct/constructor";
import { json } from "../json/src/json";
import { requiredEnvs } from "../required-envs";
import { postMessage, postEphemeral } from "../slack/api";
import { newLogger } from "../logger";
import { getOwner } from "../github/parse";
import { updateDynamo } from "../dynamo/update";
import { SQSRecord, Callback, Context } from "aws-lambda";
import { getQueue, myQueue, processFixedPR, getTeamQueue } from "./commands";
import { getTeamName, getTeamOptions, getSlackUserAlt } from "../json/parse";

import { SlashResponse } from "../models";
import { Review } from "../github/api";

const logger = newLogger("GitHubManager");

/**
 * This handler polls an SQS and processes events if any are available
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 */
export async function processEvent(
	event: AWSLambda.SQSEvent,
	context: Context,
	callback: Callback,
): Promise<void> {
	// Create an array of SQSEvent messages to process
	const messages = event.Records.map((record: SQSRecord) => {
		const parsedBody: any = JSON.parse(record.body);
		return parsedBody;
	});
	logger.debug(`Messages: ${JSON.stringify(messages)}`);

	// Map through messages to process
	await Promise.all(
		messages.map(async (message) => {
			// If the event was sent via Slack
			if (message.custom_source === "SLACK") {
				try {
					// Determine which slash command was used & store result of processing
					let response: SlashResponse;
					switch (message.command) {
						case "/sqs":
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
								body:
									"Unsupported slash command. See documentation for supported commands",
								statusCode: 200,
							};
							break;
					}
					const slackUserId = `<@${message.user_id}>`;
					const slackUser = getSlackUserAlt(slackUserId, json);
					logger.info(`Sending message to ${message.user_id}`);
					await postEphemeral(
						requiredEnvs.SLACK_API_URI,
						message.user_id,
						message.channel_id,
						requiredEnvs.SLACK_BOT_TOKEN,
						response.body,
					);
					return;
				} catch (error) {
					logger.error(`Sending error message to ${message.user_id}`);
					await postEphemeral(
						requiredEnvs.SLACK_API_URI,
						message.user_id,
						message.channel_id,
						requiredEnvs.SLACK_BOT_TOKEN,
						error.message,
					);
				}
				// Otherwise check if the source is GitHub
			} else if (message.custom_source === "GITHUB") {
				try {
					const pullRequestAction: string = message.action;

					// Construct the Slack message based on PR action and body
					const reviewClass = new Review();
					const slackMessage = await constructSlackMessage(
						pullRequestAction,
						message,
						json,
						reviewClass,
					);

					// Determine which team the user belongs to
					const githubUser = getOwner(message);
					const teamName = getTeamName(githubUser, json);
					const teamOptions = getTeamOptions(githubUser, json);

					// Check whether to disable dynamo
					let alertSlack = true;
					// Update DynamoDB with new request
					alertSlack = await updateDynamo(
						githubUser,
						message,
						json,
						pullRequestAction,
					);

					// Check whether to disable github-to-slack notifications
					if (teamOptions.Disable_GitHub_Alerts === false && alertSlack) {
						// Verify team slack channel env variable exists
						if (!requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]) {
							logger.error(
								`Expected environment variable not found: ${teamName}_SLACK_CHANNEL_NAME`,
							);
							return;
						}
						// Use team name to get channel name and slack token from required Envs
						logger.info(
							"Posting slack message to " +
								requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
						);
						await postMessage(
							requiredEnvs.SLACK_API_URI,
							requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
							requiredEnvs.SLACK_BOT_TOKEN,
							slackMessage,
						);
					}
					return;
				} catch (error) {
					// Use team name to get channel name and slack token from required Envs
					// Determine which team the user belongs to
					const githubUser = getOwner(message);
					const teamName = getTeamName(githubUser, json);
					logger.info(
						"Posting error slack message to " +
							requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
					);
					await postMessage(
						requiredEnvs.SLACK_API_URI,
						requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
						requiredEnvs.SLACK_BOT_TOKEN,
						error.message,
					);
				}
			} else {
				// This should never happen since the sqs manager controls
				// the custom-source property
				logger.info(`Recieved Unknown Event: ${JSON.stringify(message)}`);
				logger.error(
					"Message property custom_source not set to Slack or GitHub",
				);
				return;
			}
		}),
	);
}
