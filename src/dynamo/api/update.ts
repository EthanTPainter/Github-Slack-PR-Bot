import { PullRequest } from "../../models";
import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../../src/logger";
import { requiredEnvs } from "../../../src/required-envs";

const logger = newLogger("DynamoUpdate");

export class DynamoUpdate {

  async updatePullRequest(
    slackUserId: string,
    currentQueue: PullRequest[],
    updatedPR: PullRequest,
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {

    const newQueue = currentQueue.filter((pr: PullRequest) => {
      return pr.url !== updatedPR.url;
    });
    newQueue.push(updatedPR);

    try {
      logger.info("Connecting to DynamoDB...");

      // Setup
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
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
