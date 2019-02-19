import { Item, SlackUser } from "../../models";
import { DynamoGet } from "./get-item";
import { DynamoDB } from "aws-sdk";
import { DateTime } from "luxon";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";

const logger = newLogger("DynamoAppendItem");

export class DynamoAppend {

  /**
   * 
   * @description get Item from DyanmoDB table
   * @param {string} slackUser Slack username
   * @param {Item[]} currentContents Current contents in
   *                 the DynamoDB user contents
   * @param values Contents to put in contents
   */
  async appendItem(
    slackUser: SlackUser,
    currentContents: Item[],
    newItem: Item,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    try {
      logger.info("Connecting to DynamoDB...");

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Append new Item with any existing items
      currentContents.push(newItem);

      // Make timestamp for last updated time
      const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { slackUserId: slackUser.Slack_Id },
        UpdateExpression: `set contents = :d, last_updated = :t`,
        ExpressionAttributeValues: {
          ":d": currentContents,
          ":t": currentTime,
        },
      };

      // DynamoDB putItem request
      const result = await dynamoDB.update(params).promise();
      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
