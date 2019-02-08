import { formatItem } from "../../formatting/format-item";

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

    const newItem = formatItem(slackUser, event, json);
}
