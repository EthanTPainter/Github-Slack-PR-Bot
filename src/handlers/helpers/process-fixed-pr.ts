import { DynamoGet } from "../../dynamo/api";
import { requiredEnvs } from "../../required-envs";
import { json } from "../../json/src/json";
import { getTeamNameAlt } from "../../json/parse";
import { updateFixedPR } from "../../dynamo/update";
import { postMessage } from "../../slack/api/post-message";
import { SlashResponse, RequestBody } from "../../models";

export async function processFixedPR(
  body: RequestBody,
): Promise<SlashResponse> {
  if (!body.user_id) {
    const invalidUserIdMessage = `Unable to determine which slack user sent this request`;
    return new SlashResponse(invalidUserIdMessage, 200);
  }

  // Format slack user id & get slack user
  const dynamoGet = new DynamoGet();
  const slackUserId = `<@${body.user_id}>`;

  // Get User's queue
  const userQueue = await dynamoGet.getQueue(
    requiredEnvs.DYNAMO_TABLE_NAME,
    slackUserId);

  // Get fixedPR url from slack text
  const text = body.text;
  if (!text) {
    const invalidTextMessage = `Couldn't find a valid GitHub PR Url after /fixed-pr slash command`;
    return new SlashResponse(invalidTextMessage, 200);
  }
  // Use regex checking for proper URL format
  const expression = "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\."
    + "[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^"
    + "\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})";
  const regex = new RegExp(expression);
  if (!text.match(regex)) {
    const invalidUrlMessage = `Invalid URL provided. Make sure to follow this format: `
      + `/fixed-pr https://www.github.com/org/repo/pull/###`;
    return new SlashResponse(invalidUrlMessage, 200);
  }

  try {
    // Process the PR now that it's fixed
    const slackMessage = await updateFixedPR(
      slackUserId,
      text,
      userQueue,
      json);

    // Get Team name from slackUserId
    const teamName = getTeamNameAlt(slackUserId, json);

    // Post Fixed PR message in team chat
    await postMessage(requiredEnvs.SLACK_API_URI,
      requiredEnvs[teamName + "_SLACK_CHANNEL_NAME"],
      requiredEnvs[teamName + "_SLACK_TOKEN"],
      slackMessage);

    // Let user know the request was successfull
    const success = "Request successfully processed";
    return new SlashResponse(success, 200);
  }
  catch (error) {
    // Let the user know an error occurred
    const errorMessage = `Uh oh. Error occurred: ${error}`;
    return new SlashResponse(errorMessage, 200);
  }

}
