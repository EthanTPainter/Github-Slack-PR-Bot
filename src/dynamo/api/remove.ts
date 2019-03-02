import { newLogger } from "../../logger";
import { DynamoDB } from "aws-sdk";
import { requiredEnvs } from "../../required-envs";
import { PullRequest, SlackUser } from "../../models";

const logger = newLogger("DynamoRemove");

export class DynamoRemove {

  async removePullRequest(
    slackUser: SlackUser,
    currentQueue: PullRequest[],
    removePullRequest: PullRequest,
  ): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {

    // Remove removePullRequest from currentContents
    const newContents = currentQueue.filter((pr: PullRequest) => {
      return pr.url !== removePullRequest.url;
    });

    try {
      logger.info(`Removing an PullRequest from ${slackUser.Slack_Name}'s queue`);

      // Setup/Init DocumentClient for Dynamo
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

      // Provide base params as input
      const params = {
        TableName: requiredEnvs.DYNAMO_TABLE,
        Key: { slackUserId: slackUser.Slack_Id },
        UpdateExpression: `set contents = :d`,
        ExpressionAttributeValues: {
          ":d": newContents,
        },
      };

      // Dynamo deletePullRequest request
      const result = await dynamoDB.update(params).promise();
      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
