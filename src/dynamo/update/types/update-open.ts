import { DynamoGet, DynamoAppend } from "../../api";
import { formatItem } from "../../formatting/format-item";
import { getSlackMembersAlt } from "../../../json/parse";
import { newLogger } from "../../../logger";
import { DynamoDB } from "aws-sdk";
import { SlackUser } from "../../../models";

const logger = newLogger("UpdateOpen");

/**
 * @author Ethan T Painter
 * @description Update DynamoDB table and add to
 *              all queues necessary.
 * @param slackUser Slack User ID
 * @param slackTeam Slack Team ID
 * @param event Event from GitHub
 * @param json JSON config file
 */
export async function updateOpen(
  slackUser: SlackUser,
  slackTeam: SlackUser,
  event: any,
  json: any,
): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

  // Format an item as a Dynamo entry
  const newItem = formatItem(slackUser, event, json);

  let slackUserList;
  if (json.Options.Dynamo_Peer_Before_Lead
    && newItem.peerComplete === false) {
    // SlackUserList is only members
    // Remove slackUser from this list (This shouldn't be on the updater's queue)
    slackUserList = getSlackMembersAlt(slackUser, json);
    slackUserList = slackUserList.filter(user => user !== slackUser);
  }
  else {
    slackUserList = getSlackMembersAlt(slackUser, json);
  }

  // Append newItem to slackUserList contents
  // For each user in the slackUserList,
  // 1) Get Most recent contents for the user
  // 2) Append newItem to the existing contents array

  const dynamoGet = new DynamoGet();
  const dynamoUpdate = new DynamoAppend();

  const updateUserQueues = slackUserList.map(async (user) => {
    const currentItem = await dynamoGet.getItem(user);
    const currentContents = currentItem!.contents;
    const updateItems = await dynamoUpdate.appendItem(user, currentContents, newItem);
  });
  await Promise.all(updateUserQueues);

  logger.info("Successfully updated all affected slack users");

  // Append newItem to team queue
  const currentTeamItems = await dynamoGet.getItem(slackTeam);
  const currentTeamContents = currentTeamItems!.contents;
  const teamUpdate = await dynamoUpdate.appendItem(slackTeam, currentTeamContents, newItem);

  return teamUpdate;
}
