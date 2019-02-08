import { Item } from "../../models";
import { DynamoGet } from "./get-item";
import { DynamoDB } from "aws-sdk";
import { DateTime } from "luxon";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";

const logger = newLogger("UpdateItem");

export class DynamoUpdate {

  /**
   * @author Ethan T Painter
   * @description get Item from DyanmoDB table
   * @param {string} githubUser GitHub username
   * @param values Contents to put in contents
   */
  async updateItem(
    githubUser: string,
    newItem: Item,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    try {
      logger.info("Connecting to DynamoDB...");

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Get current contents for the user
      const dynamoGet = new DynamoGet();
      const getResult = await dynamoGet.getItem(githubUser);

      // Append new Item with any existing items
      let newContents: Item[] = [];
      if (getResult !== undefined) {
        newContents = getResult.Item.contents;
      }
      newContents.push(newItem);

      // Make timestamp for last updated time
      const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { githubUser: githubUser },
        UpdateExpression: `set contents = :d, last_updated = :t`,
        ExpressionAttributeValues: {
          ":d": newContents,
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
