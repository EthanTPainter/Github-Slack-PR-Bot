const uuid = require("uuid/v4");
import * as querystring from "querystring";
import { APIGatewayEvent, Context, Callback } from "aws-lambda";
import * as AWS from "aws-sdk";

import { requiredEnvs } from "../required-envs";
import { newLogger } from "../logger";
import { SlashResponse, SQSParams } from "../models";
import { USER_AGENTS, CUSTOM_SOURCES } from "../../src/enums";

const logger = newLogger("SQSManager");

/**
 * @description Processes GitHub Webhook POST requests
 * and sends each through to an SQS for processing
 * @param event Lambda Event
 * @param context Lambda context
 * @param callback Lambda callback
 */
export async function processRequestToSQS(
	event: APIGatewayEvent,
	context: Context,
	callback: Callback,
): Promise<SlashResponse> {
	// Verify the body is not empty, undefined, or null
	if (!event.body) {
		logger.warn(`No body found in the event: ${JSON.stringify(event)}`);
		return new SlashResponse(
			`Did not receive any data to process. Please try again!`,
			200,
		);
	}

	// Determine if request is from Slack or GitHub
	const userAgent = event.headers["User-Agent"];
	const slackSource = userAgent.includes(USER_AGENTS.SLACKBOT) ? true : false;

	// Add custom-source, messageId, and label new body accordingly
	let body: any;
	const messageId = uuid();
	if (slackSource) {
		const oldBody = querystring.parse(event.body);
		body = JSON.stringify({
			custom_source: CUSTOM_SOURCES.SLACK,
			unique_message_id: messageId,
			...oldBody,
		});
	} else {
		const oldBody = JSON.parse(event.body);
		body = JSON.stringify({
			custom_source: CUSTOM_SOURCES.GITHUB,
			unique_message_id: messageId,
			...oldBody,
		});
	}

	// SQS initialization
	const sqs = new AWS.SQS({ apiVersion: requiredEnvs.SQS_API_VERSION });
	const sqsParams = new SQSParams(body, requiredEnvs.SQS_URL);

	// Publish message to SQS or catch error
	try {
		await sqs.sendMessage(sqsParams).promise();
		return new SlashResponse("", 200);
	} catch (error) {
		logger.error(error.stack);
		logger.warn(`Error sending message to sqs. Attempting again...`);
		try {
			await sqs.sendMessage(sqsParams).promise();
			return new SlashResponse("", 200);
		} catch (error) {
			logger.error(
				`Error retrying attempt to send message to sqs. Returning an error message.`,
			);
			logger.error(error.stack);

			const errorResponse =
				slackSource === true
					? new SlashResponse(
							`Failed processing request. Please try again!`,
							200,
					  )
					: new SlashResponse("", 200);
			return errorResponse;
		}
	}
}
