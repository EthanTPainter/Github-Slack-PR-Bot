import { requiredEnvs } from "../../required-envs";
import { DynamoGet } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { json } from "../../json/src/json";
import { SlashResponse, RequestBody } from "../../models";
import { getSlackUserAlt, getSlackGroupFromGroupId } from "../../json/parse";

export async function getQueue(body: RequestBody): Promise<SlashResponse> {
	try {
		if (body.text === undefined) {
			return new SlashResponse("No text attached to request", 200);
		}
		const submittedUserId = `<@${body.user_id}>`;

		// Setup
		const dynamoGet = new DynamoGet();

		// Parse text in slash command for slack user id's
		const regex = /<@([A-Za-z0-9]*)[|]([A-Za-z0-9]*)[.]([A-Za-z0-9]*)>|<!subteam[^]([A-Z0-9]*[|][@]([A-Za-z0-9])*)>/g;
		const slackIds = body.text.match(regex);

		// No Id's found
		if (slackIds === null) {
			const empty =
				`To use this command, use @ with your usernames or team names. ` +
				`Make sure to enable escape characters on each slash command.`;
			return new SlashResponse(empty, 200);
		}

		const slackMessages = slackIds.map(async slackId => {
			// If one of the slack ids is a slack user group
			if (slackId.includes("subteam")) {
				// Get team's queue & format into a string
				const slackUser = getSlackGroupFromGroupId(slackId, json);
				const userQueue = await dynamoGet.getQueue(
					requiredEnvs.DYNAMO_TABLE_NAME,
					slackId,
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
				newSlackId,
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
}
