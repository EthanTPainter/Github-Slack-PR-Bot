import { DynamoDB } from "aws-sdk";
import { DateTime } from "luxon";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { SlackUser } from "../../models";

const logger = newLogger("DynamoResetItem");

export class DynamoReset {

  /**
   * 
   * @description get Item from DyanmoDB table
   * @param {string} slackUser Slack username
   * @returns Result of dynamoDB Get request
   */
  async resetItems(
    slackUser: SlackUser,
  ): Promise<DynamoDB.DocumentClient.AttributeMap | undefined> {

    try {
      logger.info(`Reseting Contents for User: ${slackUser}`);

      // Construct empty Item
      const emptyItem: any = [];

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Make timestamp for last updated time
      const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { slackUserId: slackUser.Slack_Id },
        UpdateExpression: `set contents = :d, last_updated = :t`,
        ExpressionAttributeValues: {
          ":d": emptyItem,
          ":t": currentTime,
        },
      };

      // DynamoDB getItem request
      const result = await dynamoDB.update(params).promise();

      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
