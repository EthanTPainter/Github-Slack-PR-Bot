import { formatItem } from "../../formatting/format-item";
import { getSlackMembersAlt } from "../../../json/parse";

/**
 * @author Ethan T Painter
 * @description Update DynamoDB table and add to
 *              all queues necessary.
 * @param slackUser Slack User ID
 * @param event Event from GitHub
 * @param json JSON config file
 */
export function updateOpen(
  slackUser: string,
  event: any,
  json: any,
): void {

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

  // For each user in the slackUserList,
  // 1) Get Most recent contents for the user
  // 2) Append newItem to the end
}
