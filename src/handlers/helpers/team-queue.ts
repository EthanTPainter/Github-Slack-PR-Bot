import * as querystring from "querystring";
import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { DynamoGet } from "../../dynamo/api";
import { formatTeamQueue } from "../../dynamo/formatting";
import { getSlackGroupAlt } from "../../json/parse";
import { SlashResponse } from "../../models";

export async function getTeamQueue(
  event: any,
): Promise<SlashResponse> {
  // Convert x-www-urlencoded string to JSON notation
  const body = querystring.parse(event.body);

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
      teamName.Slack_Id);

    // Format queue from array to string
    const formattedQueue = formatTeamQueue(teamQueue, json);
    return new SlashResponse(formattedQueue, 200);
  }
  catch (error) {
    // Error encountered. Let the user know in Slack
    const errorMessage = `Uh oh. Error occurred: ${error.message}`;
    return new SlashResponse(errorMessage, 200);
  }
}
