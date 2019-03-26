import * as querystring from "querystring";
import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { DynamoGet } from "../../dynamo/api";
import { formatMyQueue } from "../../dynamo/formatting";
import { SlashResponse } from "../../models";

export async function getMyQueue(
  event: any,
): Promise<SlashResponse> {
  // Convert x-www-urlencoded string to JSON notation
  const body = querystring.parse(event.body);

  // Verify user_id property is not malformed
  if (body.user_id === undefined) {
    throw new Error("body.user_id not attched to request");
  }

  // Format Slack User ID & get Slack User
  const dynamoGet = new DynamoGet();
  const slackUserId = `<@${body.user_id}>`;

  try {
    // Get User Queue
    const userQueue = await dynamoGet.getQueue(
      requiredEnvs.DYNAMO_TABLE_NAME,
      slackUserId);

    // Format queue from array to string
    const formattedQueue = formatMyQueue(userQueue, json);
    return new SlashResponse(formattedQueue, 200);
  }
  catch (error) {
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    return new SlashResponse(errorMessage, 200);
  }
}
