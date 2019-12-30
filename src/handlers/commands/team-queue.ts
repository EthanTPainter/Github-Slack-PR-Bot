import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { DynamoGet, DynamoUpdate } from "../../dynamo/api";
import { formatTeamQueue } from "../../dynamo/formatting";
import { getSlackGroupAlt } from "../../json/parse";
import { SlashResponse, RequestBody } from "../../models";
import { DynamoFilter } from "../../../src/dynamo/filter/dynamo-filter";

/**
 * @description Get the queue for the team
 * @param body Body sent from the Slack API
 * @param messageId SQS Event message id
 */
export async function getTeamQueue(
	body: RequestBody,
	messageId: string,
): Promise<SlashResponse> {
	// Verify user_id property is not missing
	const userId = body.user_id;
	if (!userId) {
		throw new Error("body.user_id not attached to request");
	}
	if (typeof userId === "object") {
		throw new Error(`body.user_id sent as an object rather than a string`);
	}

	// Format Slack User Id & get Slack User
	const dynamoGet = new DynamoGet();
	const slackUserID = `<@${body.user_id}>`;

	try {
		// Get Team Queue
		const teamName = getSlackGroupAlt(slackUserID, json);
		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.DYNAMO_TABLE_NAME,
			teamName,
		);

		// Verify the team message ids do not have the
		// current message id in the list
		const dynamoFilter = new DynamoFilter();
		const dynamoUpdate = new DynamoUpdate();
		const teamMessageIds = await dynamoGet.getMessageIds(
			requiredEnvs.DYNAMO_TABLE_NAME,
			teamName,
		);
		const isRepeatedMessageId = dynamoFilter.checkMessageIds(
			teamMessageIds,
			messageId,
		);
		if (isRepeatedMessageId) {
			return new SlashResponse("", 200);
		}
		const newTeamMessageIds = dynamoFilter.addNewMessageId(
			teamMessageIds,
			messageId,
		);
		// Update team message ids in dynamo
		await dynamoUpdate.updateMessageIds(
			requiredEnvs.DYNAMO_TABLE_NAME,
			teamName,
			newTeamMessageIds,
		);

		// Format queue from array to string
		const formattedQueue = formatTeamQueue(teamQueue, json);
		return new SlashResponse(formattedQueue, 200);
	} catch (error) {
		// Error encountered. Let the user know in Slack
		const errorMessage = `Uh oh. Error occurred: ${error.message}`;
		return new SlashResponse(errorMessage, 200);
	}
}
