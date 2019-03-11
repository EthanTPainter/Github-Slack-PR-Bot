import { PullRequest, SlackUser } from "../../models";
import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";

const logger = newLogger("DynamoAppend");

export class DynamoAppend {

  /**
   * @description append PR to slack user's queue
   * @param dynamoTableName Name of dynamo table
   * @param slackUserId Slack user Id
   * @param currentQueue Current queue for a Slack user
   * @param newPullRequest New PR to add to the end of the queue
   */
  async appendPullRequest(
    dynamoTableName: string,
    slackUserId: string,
    currentQueue: PullRequest[],
    newPullRequest: PullRequest,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    try {
      logger.info(`Appending new PR to User ID: ${slackUserId}'s queue`);

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Append new PullRequest with any existing PullRequests
      currentQueue.push(newPullRequest);

      // Provide base params as input
      const params = {
        TableName: dynamoTableName,
        Key: { slackUserId: slackUserId },
        UpdateExpression: `set queue = :d`,
        ExpressionAttributeValues: {
          ":d": currentQueue,
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
