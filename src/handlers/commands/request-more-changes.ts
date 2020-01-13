import { json } from "../../json/src/json";
import { SlashResponse, RequestBody } from "../../models";
import { DynamoGet, DynamoUpdate } from "../../dynamo/api";
import { DynamoFilter } from "../../dynamo/filter/dynamo-filter";
import { getSlackUserAlt, getTeamNameAlt } from "../../json/parse";
import { requiredEnvs } from "../../required-envs";
import { postMessage } from "../../slack/api";
import { updateRequestMoreChanges } from "../../dynamo/update";

export async function requestMoreChanges(
	body: RequestBody,
	slackToken: string,
	messageId: string,
): Promise<SlashResponse> {
	if (!body.user_id) {
		const invalidUserIdMessage = `Unable to determine which slack user sent this request`;
		return new SlashResponse(invalidUserIdMessage, 200);
	}

	// Format slack user id and get slack user
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
	const isRepeatedMessageId = await dynamoFilter.checkMessageIds(
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

	// Get PR URL from the slack text
	const text = body.text;
	if (!text) {
		const invalidTextMessage = `Couldn't find a valid GitHub PR Url after /request-more-changes slash command`;
		return new SlashResponse(invalidTextMessage, 200);
	}

	// Use regex checking for proper URL format
	const expression = /https:[/][/](www.github.com|github.com)[/]([A-Za-z0-9-]*)[/]([A-Za-z0-9-]*)[/]([pulls|pull])*[/]([0-9]*)/g;
	const regex = new RegExp(expression);
	if (!text.match(regex)) {
		const invalidRegexMessage =
			`Invalid URL provided. Make sure to follow this format: ` +
			`/request-more-changes https://www.github.com/org/repo/pull/123`;
		return new SlashResponse(invalidRegexMessage, 200);
	}
	const filteredText = text.match(regex);
	if (!filteredText) {
		const nofoundURL =
			"No GitHub PR Url found after /request-more-changes command";
		return new SlashResponse(nofoundURL, 200);
	}
	const prUrl = filteredText[0];

	try {
		// Process the PR now that the user is requesting more changes
		const update = await updateRequestMoreChanges(
			slackUser,
			prUrl,
			requiredEnvs.DYNAMO_TABLE_NAME,
			json,
    );

    // If a failure was encountered during processing
    // only alert the user who issued the command
    if (update.failure) {
      return new SlashResponse(update.response, 200);
    }

		// Get team name from slackUserId
		const teamName = getTeamNameAlt(slackUserId, json);
		if (!requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"]) {
			const missingEnvName = `Application environment variables missing: ${teamName}_SLACK_CHANNEL_NAME`;
			return new SlashResponse(missingEnvName, 200);
		}

		// Post requested more changes message in team chat
		await postMessage(
			requiredEnvs.SLACK_API_URI,
			requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"] as string,
			slackToken,
			update.response,
		);

		// Return empty response since message should be posted in team chat
		return new SlashResponse("", 200);
	} catch (error) {
		const errorMessage = `Uh oh. Error occurred: ${error.message}`;
		return new SlashResponse(errorMessage, 200);
	}
}
