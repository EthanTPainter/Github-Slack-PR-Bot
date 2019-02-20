import { Item } from "../../models";
import { newLogger } from "../../logger";

const logger = newLogger("FormatMyQueue");

/**
 * @description Format a queue from a raw DynamoDB stored
 * array into a stringified version to present on Slack
 * @param queue DynamoDB stored queue for a user
 * @returns String of the DynamoDB queue contents
 */
export function formatMyQueue(
  queue: Item[],
  ): string {
  let formattedQueue: string = "";

  // If the queue is empty
  if (queue.length === 0) {
    formattedQueue = "Nothing found in your queue";
    return formattedQueue;
  }

  // If the queue has contents, display them sorted:
  queue.map((pr: Item) => {
    formattedQueue += `${pr.title} [${pr.url}]\n`;
  });
  logger.info(`formattedQueue: ${formattedQueue}`);

  return formattedQueue;
}
