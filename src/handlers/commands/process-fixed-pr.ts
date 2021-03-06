import { DynamoGet, DynamoUpdate } from "../../dynamo/api";
import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { getTeamNameAlt, getSlackUserAlt } from "../../json/parse";
import { updateFixedPR } from "../../dynamo/update";
import { postMessage } from "../../slack/api/post-message";
import { SlashResponse, RequestBody } from "../../models";
import { DynamoFilter } from "../../../src/dynamo/filter/dynamo-filter";

export async function processFixedPR(
	body: RequestBody,
	slackToken: string,
	messageId: string,
): Promise<SlashResponse> {
	if (!body.user_id) {
		const invalidUserIdMessage = `Unable to determine which slack user sent this request`;
		return new SlashResponse(invalidUserIdMessage, 200);
	}

	// Format slack user id & get slack user
	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoUpdate();
	const dynamoFilter = new DynamoFilter();
	const slackUserId = `<@${body.user_id}>`;
	const slackUser = getSlackUserAlt(slackUserId, json);

	// Verify if the message id is in the submitted user's message ids
	const userMessageIds = await dynamoGet.getMessageIds(
		requiredEnvs.DYNAMO_TABLE_NAME,
		slackUser,
	);
	const isRepeatedMessageId = dynamoFilter.checkMessageIds(
		userMessageIds,
		messageId,
	);
	if (isRepeatedMessageId) {
		return new SlashResponse("", 200);
	}
	const newMessageIds = dynamoFilter.addNewMessageId(userMessageIds, messageId);
	await dynamoUpdate.updateMessageIds(
		requiredEnvs.DYNAMO_TABLE_NAME,
		slackUser,
		newMessageIds,
	);

	// Get User's queue
	const userQueue = await dynamoGet.getQueue(
		requiredEnvs.DYNAMO_TABLE_NAME,
		slackUser,
	);

	// Get fixedPR url from slack text
	const text = body.text;
	if (!text) {
		const invalidTextMessage = `Couldn't find a valid GitHub PR Url after /fixed-pr slash command`;
		return new SlashResponse(invalidTextMessage, 200);
	}
	// Use regex checking for proper URL format
	// tslint:disable-next-line: max-line-length
	const expression = /https:[/][/](www.github.com|github.com)[/]([A-Za-z0-9-]*)[/]([A-Za-z0-9-]*)[/]([pulls|pull])*[/]([0-9]*)/g;
	const regex = new RegExp(expression);
	if (!text.match(regex)) {
		const invalidUrlMessage =
			`Invalid URL provided. Make sure to follow this format: ` +
			`/fixed-pr https://www.github.com/org/repo/pull/123`;
		return new SlashResponse(invalidUrlMessage, 200);
	}
	const filteredText = text.match(regex);
	if (!filteredText) {
		const noFoundURL = "No github pr url found after /fixed-pr slash command";
		return new SlashResponse(noFoundURL, 200);
	}
	const prURL = filteredText[0];

	try {
		// Process the PR now that it's fixed
		const slackMessage = await updateFixedPR(
			slackUserId,
			prURL,
			userQueue,
			requiredEnvs.DYNAMO_TABLE_NAME,
			json,
		);

		// Get Team name from slackUserId
		const teamName = getTeamNameAlt(slackUserId, json);

		if (!requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]) {
			const missingEnvName = `Application environment variables missing: ${teamName}_SLACK_CHANNEL_NAME`;
			return new SlashResponse(missingEnvName, 200);
		}
		// Post Fixed PR message in team chat
		await postMessage(
			requiredEnvs.SLACK_API_URI,
			requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"] as string,
			slackToken,
			slackMessage,
		);

		// Return empty response since message should be posted in team chat
		const empty = "";
		return new SlashResponse(empty, 200);
	} catch (error) {
		// Let the user know an error occurred
		const errorMessage = `Uh oh. Error occurred: ${error.message}`;
		return new SlashResponse(errorMessage, 200);
	}
}
