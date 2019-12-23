import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { DynamoGet } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { SlashResponse, RequestBody } from "../../models";
import { getSlackUserAlt } from "../../json/parse";

export async function getMyQueue(body: RequestBody): Promise<SlashResponse> {
	// Verify user_id property is not malformed
	if (body.user_id === undefined) {
		throw new Error("body.user_id not attched to request");
	}

	// Format Slack User ID & get Slack User
	const dynamoGet = new DynamoGet();
	const slackUserId = `<@${body.user_id}>`;

	try {
		const slackUser = getSlackUserAlt(slackUserId, json);
		// Get User Queue
		const userQueue = await dynamoGet.getQueue(
			requiredEnvs.DYNAMO_TABLE_NAME,
			slackUser,
		);

		// Format queue from array to string
		const formattedQueue = formatMyQueue(
			slackUserId,
			slackUser,
			userQueue,
			json,
		);
		return new SlashResponse(formattedQueue, 200);
	} catch (error) {
		const errorMessage = `Uh oh. Error occurred: ${error.message}`;
		return new SlashResponse(errorMessage, 200);
	}
}
