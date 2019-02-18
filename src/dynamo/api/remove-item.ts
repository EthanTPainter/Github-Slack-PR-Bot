import { newLogger } from "../../logger";
import { DynamoDB } from "aws-sdk";
import { requiredEnvs } from "../../required-envs";
import { Item, SlackUser } from "../../models";

const logger = newLogger("DynamoRemove");

export class DynamoRemove {

  async removeItem(
    slackUser: SlackUser,
    currentContents: Item[],
    removeItem: Item,
  ): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {

    try {
      logger.info(`Removing an item from ${slackUser}`);

      // Setup/Init DocumentClient for Dynamo
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

      // Dynamo deleteItem request
      const result = await dynamoDB.update(params).promise();
      return result;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
