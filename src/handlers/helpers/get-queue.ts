import { requiredEnvs } from "../../required-envs";
import { DynamoGet } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { json } from "../../json/src/json";
import { SlashResponse, RequestBody } from "../../models";
import { getSlackUserAlt } from "../../json/parse";

export async function getQueue(
  body: RequestBody,
): Promise<SlashResponse> {
  try {
    if (body.text === undefined) {
      throw new Error("No text attached to request");
    }

    // Setup
    const dynamoGet = new DynamoGet();

    // Parse text in slash command for slack user id's
    const regex = /<@([A-Z0-9]*)>|<!subteam[^]([A-Z0-9]*[|][@]([A-Za-z0-9])*)>/g;
    const slackIds = body.text.match(regex);

    // No Id's found
    if (slackIds === null) {
      const empty = `To use this command, include /"@user/" or /"@team/" after the slash command`;
      return new SlashResponse(empty, 200);
    }

    const slackMessage = slackIds.map(async (slackId) => {
      const slackUser = getSlackUserAlt(slackId, json);
      // Get user's queue & format into a string
      const userQueue = await dynamoGet.getQueue(
        requiredEnvs.DYNAMO_TABLE_NAME,
        slackId);
      return formatMyQueue(slackUser, userQueue, json);
    });

    return new SlashResponse(slackMessage.toString(), 200);
  }
  catch (error) {
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    return new SlashResponse(errorMessage, 200);
  }
}
