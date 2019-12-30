import { requiredEnvs } from "../../required-envs";
import { DynamoGet, DynamoUpdate } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { json } from "../../json/src/json";
import { SlashResponse, RequestBody } from "../../models";
import { getSlackUserAlt, getSlackGroupFromGroupId } from "../../json/parse";
import { DynamoFilter } from "../../../src/dynamo/filter/dynamo-filter";
import { newLogger } from "../../logger";

const logger = newLogger("GetQueue");

export async function getQueue(
	body: RequestBody,
	messageId: string,
): Promise<SlashResponse> {
	try {
		if (body.text === undefined) {
			return new SlashResponse("No text attached to request", 200);
		}
		const submittedUserId = `<@${body.user_id}>`;
		const submittedSlackUser = getSlackUserAlt(submittedUserId, json);

		// Setup
		const dynamoGet = new DynamoGet();
		const dynamoUpdate = new DynamoUpdate();
		const dynamoFilter = new DynamoFilter();

		// Verify if the message id is in the submitted user's message ids
		const userMessageIds = await dynamoGet.getMessageIds(
			requiredEnvs.DYNAMO_TABLE_NAME,
			submittedSlackUser,
		);
		const isRepeatedMessageId = dynamoFilter.checkMessageIds(
			userMessageIds,
			messageId,
		);
		if (isRepeatedMessageId) {
			return new SlashResponse("", 200);
		}
		const newMessageIds = dynamoFilter.addNewMessageId(
			userMessageIds,
			messageId,
		);
		await dynamoUpdate.updateMessageIds(
			requiredEnvs.DYNAMO_TABLE_NAME,
			submittedSlackUser,
			newMessageIds,
		);

		// Parse text in slash command for slack user id's
		const regex = /<@([A-Za-z0-9]*)[|]([A-Za-z0-9]*)[.]([A-Za-z0-9]*)>|<!subteam[^]([A-Z0-9]*[|][@]([A-Za-z0-9])*)>/g;
		const slackIds = body.text.match(regex);

		// No Id's found
		if (slackIds === null) {
			const empty =
				`To use this command, use @ with your usernames or team names. ` +
				`Make sure to enable escape characters on each slash command in the Slack app settings.`;
			return new SlashResponse(empty, 200);
		}

		try {
			const slackMessages = slackIds.map(async (slackId) => {
				// If one of the slack ids is a slack user group
				if (slackId.includes("subteam")) {
					// Get team's queue & format into a string
					const slackUser = getSlackGroupFromGroupId(slackId, json);
					const userQueue = await dynamoGet.getQueue(
						requiredEnvs.DYNAMO_TABLE_NAME,
						slackUser,
					);
					return formatMyQueue(submittedUserId, slackUser, userQueue, json);
				}
				// Otherwise assume it's a user's slack id
				// Change from "<@ABCD|first.last>" to "<@ABCD>"
				const userRegex = /<@([A-Za-z0-9]*)/g;
				const newSlackId = slackId.match(userRegex) + ">";

				// Get user's queue & format into a string
				const slackUser = getSlackUserAlt(newSlackId, json);
				const userQueue = await dynamoGet.getQueue(
					requiredEnvs.DYNAMO_TABLE_NAME,
					slackUser,
				);
				return formatMyQueue(submittedUserId, slackUser, userQueue, json);
			});

			return Promise.all(slackMessages).then((response) => {
				let formattedResponse: string = "";
				response.map((resp) => {
					formattedResponse += resp + "\n";
				});
				return new SlashResponse(formattedResponse, 200);
			});
		} catch (error) {
			const errorMessage = `Uh oh. Error occurred: ${error.message}`;
			return new SlashResponse(errorMessage, 200);
		}
	} catch (error) {
		logger.error(`Found an error: ${error.stack}`);
		return new SlashResponse(error.message, 200);
	}
}
