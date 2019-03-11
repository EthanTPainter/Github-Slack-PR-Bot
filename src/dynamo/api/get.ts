import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { PullRequest } from "../../models";

const logger = newLogger("DynamoGetPullRequest");

export class DynamoGet {

  /**
   * @description Get queue given slack user id
   * @param dynamoTableName Name of the dynamo table
   * @param slackUserId Slack user Id
   * @returns Result of dynamoDB Get request
   */
  async getQueue(
    dynamoTableName: string,
    slackUserId: string,
  ): Promise<PullRequest[]> {

    try {
      logger.info(`Getting Queue for User ID: ${slackUserId}`);

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Provide base params as input
      const params = {
        TableName: dynamoTableName,
        Key: { slackUserId: slackUserId },
        AttributesToGet: [
          "queue",
        ],
        ReturnValues: "ALL_NEW",
      };

      // DynamoDB getPullRequest request
      const result = await dynamoDB.get(params).promise();
      const item = result.Item;
      if (item === undefined) {
        throw new Error(`User ID ${slackUserId} queue not found`);
      }

      // Retrun queue for user
      return item.queue;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
