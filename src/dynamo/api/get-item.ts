import { DynamoDB, AWSError } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "src/required-envs";

const logger = newLogger("GetItem");

export class GetItem {

  getItem(): any {
    try {
      logger.info("Connecting to DynamoDB...");
      const dynamoDB = new DynamoDB.DocumentClient({
        apiVersion: requiredEnvs.DYNAMO_API_VERSION,
        region: requiredEnvs.DYNAMO_REGION,
      });

    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}
