import { Item } from "../../models";
import { newLogger } from "../../logger";
import { getTeamOptionsAlt } from "../../json/parse";
import { constructQueueString } from "../../slack/message/construct/description";

const logger = newLogger("FormatMyQueue");

/**
 * @description Format a queue from a raw DynamoDB stored
 * array into a stringified version to present on Slack
 * @param queue DynamoDB stored queue for a user
 * @returns String of the DynamoDB queue contents
 */
export function formatMyQueue(
  queue: Item[],
  json: any,
  ): string {
  let formattedQueue: string = "";

  // If the queue is empty
  if (queue.length === 0) {
    formattedQueue = "Nothing found in your queue";
    return formattedQueue;
  }

  // If the queue has contents, display them sorted:
  queue.map((pr: Item) => {
    const options = getTeamOptionsAlt(pr.owner, json);
    formattedQueue += constructQueueString(pr, options);
  });
  logger.info(`formattedQueue: ${formattedQueue}`);

  return formattedQueue;
}
