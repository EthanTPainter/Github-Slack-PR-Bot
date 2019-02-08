import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../../src/required-envs";

const logger = newLogger("GetItem");

export class DynamoGet {

  /**
   * @author Ethan T Painter
   * @description get Item from DyanmoDB table
   * @param {string} githubUser GitHub username
   * @returns Result of dynamoDB Get request
   */
  async getItem(
    githubUser: string,
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
        Key: { githubUser: githubUser },
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
