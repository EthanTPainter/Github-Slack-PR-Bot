import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../../src/required-envs";
import { SlackUser } from "../../models";

const logger = newLogger("DynamoGetItem");

export class DynamoGet {

  /**
   * @description get Item from DyanmoDB table
   * @param {string} slackUser Slack user
   * @returns Result of dynamoDB Get request
   */
  async getItem(
    slackUser: SlackUser,
  ): Promise<DynamoDB.DocumentClient.AttributeMap | undefined> {

    try {
      logger.info("Connecting to DynamoDB...");

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { slackUserId: slackUser.Slack_Id },
        AttributesToGet: [
          "contents",
          "last_updated",
        ],
        ReturnValues: "ALL_NEW",
      };

      // DynamoDB getItem request
      const result = await dynamoDB.get(params).promise();
      const item = result.Item;

      return item;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
