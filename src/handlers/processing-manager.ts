import { SQSRecord, Callback, Context } from "aws-lambda";

import { json } from "../json/src/json";
import { getTeamName, getTeamOptions, getSlackUserAlt } from "../json/parse";
import { getQueue, getMyQueue, processFixedPR, getTeamQueue } from "./commands";

import { constructSlackMessage } from "../slack/message/construct/constructor";
import { requiredEnvs } from "../required-envs";
import { postMessage, postEphemeral } from "../slack/api";
import { newLogger } from "../logger";
import { updateDynamo } from "../dynamo/update";
import { SlashResponse } from "../models";

import { Review } from "../github/api";
import { getOwner } from "../github/parse";
import { SSMRetriever } from "../../src/ssm";
import { CUSTOM_SOURCES, SLASH_COMMANDS } from "../../src/enums";

const logger = newLogger("ProcessingManager");

/**
 * This handler polls an SQS and processes events if any are available
 *
 * @param event SQS Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 */
export async function processEvent(
	event: AWSLambda.SQSEvent,
	context: Context,
	callback: Callback,
): Promise<void> {
	// TODO: Add idempotency back
	// Create an array of SQSEvent messages to process
	const messages = event.Records.map((record: SQSRecord) => {
		const parsedBody: any = JSON.parse(record.body);
		return parsedBody;
	});
	logger.debug(`Messages: ${JSON.stringify(messages)}`);

	// Retrieve values from SSM Parameters
	const ssm = new SSMRetriever(requiredEnvs.SSM_API_VERSION);
	const tokens = await ssm.getValues(
		requiredEnvs.SLACK_BOT_TOKEN_SSM_PARAM,
		requiredEnvs.GITHUB_OAUTH_TOKEN_SSM_PARAM,
	);

	// Map through messages to process
	await Promise.all(
		messages.map(async (message) => {
			logger.info(`Message: ${JSON.stringify(message)}`);

			switch (message.custom_source) {
				case CUSTOM_SOURCES.SLACK: {
					// Determine which slash command was used
					let response: SlashResponse;
					switch (message.command) {
						case SLASH_COMMANDS.ECHO:
							response = {
								body: "Slash command /echo received!",
								statusCode: 200,
							};
							break;
						case SLASH_COMMANDS.TEAM_QUEUE:
							response = await getTeamQueue(message);
							break;
						case SLASH_COMMANDS.MY_QUEUE:
							response = await getMyQueue(message);
							break;
						case SLASH_COMMANDS.GET_QUEUE:
							response = await getQueue(message);
							break;
						case SLASH_COMMANDS.FIXED_PR:
							response = await processFixedPR(message, tokens.Slack_Token);
						default:
							response = {
								body:
									"Unsupported slash command. See documentation for available slash commands",
								statusCode: 200,
							};
							break;
					}
					await postEphemeral(
						requiredEnvs.SLACK_API_URI,
						message.user_id,
						message.channel_id,
						tokens.Slack_Token,
						response.body,
					);
					return;
				}
				case CUSTOM_SOURCES.GITHUB: {
					// Verify if the message is from a webhook init request
					// Webhook init requests lack a pull_request property
					if (!message.pull_request) {
						logger.info(`Webhook from ${message.repository.name} initialized`);
						return;
					}

					// Construct the Slack message based on PR action and body
					const pullRequestAction: string = message.action;
					const reviewClass = new Review();
					const slackMessage = await constructSlackMessage(
						pullRequestAction,
						message,
						json,
						reviewClass,
						tokens.GitHub_Token,
					);

					// Determine which team the user belongs to
					const githubUser = getOwner(message);
					const teamName = getTeamName(githubUser, json);
					const teamOptions = getTeamOptions(githubUser, json);

					const alertSlack = await updateDynamo(
						githubUser,
						message,
						json,
						pullRequestAction,
					);

					// Check whether to disable github to slack notifications
					if (teamOptions.Disable_GitHub_Alerts === false && alertSlack) {
						// Verify the selected team slack channel environment variable exists
						if (!requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]) {
							logger.error(
								`Expected environment variable not found: ${teamName}_SLACK_CHANNEL_NAME`,
							);
							return;
						}

						// Use team name to post message to team slack channel
						logger.info(
							"Posting slack message to " +
								requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
						);
						await postMessage(
							requiredEnvs.SLACK_API_URI,
							requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"] as string,
							tokens.Slack_Token,
							slackMessage,
						);
					}
					return;
				}
				default: {
					// This should never happen since the sqs manager controls
					// the custom-source property
					logger.info(`Recieved Unknown Event: ${JSON.stringify(message)}`);
					logger.error(
						`Message property custom_source not set to ${CUSTOM_SOURCES.SLACK} or ${CUSTOM_SOURCES.GITHUB}`,
					);
					return;
				}
			}
		}),
	);
}
