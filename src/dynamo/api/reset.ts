import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { SlackUser, PullRequest } from "../../models";

const logger = newLogger("DynamoResetPullRequest");

export class DynamoReset {

  /**
   * @description reset queue for slack user Id
   * @param dynamoTableName Name of the dynamo table
   * @param slackUserId Slack username Id
   * @returns Result of dynamoDB Get request
   */
  async resetQueue(
    dynamoTableName: string,
    slackUserId: string,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    try {
      logger.info(`Reseting queue for User: ${slackUserId}`);

      // Construct empty PullRequest
      const emptyPullRequest: PullRequest[] = [];

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Provide base params as input
      const params = {
        TableName: dynamoTableName,
        Key: { slackUserId: slackUserId },
        UpdateExpression: `set queue = :d`,
        ExpressionAttributeValues: {
          ":d": emptyPullRequest,
        },
      };

      // DynamoDB getPullRequest request
      const result = await dynamoDB.update(params).promise();
      if ( result === undefined){
        throw new Error(`User ID ${slackUserId} queue not found`);
      }

      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
