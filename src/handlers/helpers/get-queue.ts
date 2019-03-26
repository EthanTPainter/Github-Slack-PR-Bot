import { requiredEnvs } from "../../required-envs";
import { DynamoGet } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { json } from "../../json/src/json";
import { SlashResponse, RequestBody } from "../../models";

export async function getQueue(
  body: RequestBody,
): Promise<SlashResponse> {
  try {
    if (body.user_id === undefined) {
      throw new Error("body.user_id is not attached to request");
    }

    // Format slack user id & get slack user queue
    const dynamoGet = new DynamoGet();
    const slackUserId = `<@${body.user_id}>`;

    // Get user's queue
    const userQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      slackUserId);

    // Format the user queue
    const formattedQueue = formatMyQueue(userQueue, json);
    return new SlashResponse(formattedQueue, 200);
  }
  catch (error) {
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    return new SlashResponse(errorMessage, 200);
  }
}
