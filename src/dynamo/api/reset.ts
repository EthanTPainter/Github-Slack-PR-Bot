import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { SlackUser, PullRequest } from "../../models";

const logger = newLogger("DynamoResetPullRequest");

export class DynamoReset {

  /**
   * @description get PullRequest from DyanmoDB table
   * @param {string} slackUser Slack username
   * @returns Result of dynamoDB Get request
   */
  async resetPullRequests(
    slackUser: SlackUser,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    try {
      logger.info(`Reseting Contents for User: ${slackUser}`);

      // Construct empty PullRequest
      const emptyPullRequest: PullRequest[] = [];

      // Setup/Init DocumentClient for DynamoDB
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { slackUserId: slackUser.Slack_Id },
        UpdateExpression: `set queue = :d`,
        ExpressionAttributeValues: {
          ":d": emptyPullRequest,
        },
      };

      // DynamoDB getPullRequest request
      const result = await dynamoDB.update(params).promise();
      if ( result === undefined){
        throw new Error(`User ID ${slackUser.Slack_Id} queue not found`);
      }

      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
