import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { PullRequest, SlackUser } from "../../models";

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
		slackUser: SlackUser,
	): Promise<PullRequest[]> {
		try {
			logger.info(`Getting Queue for User: ${slackUser.Slack_Name}`);

			// Setup/Init DocumentClient for DynamoDB
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				region: requiredEnvs.DYNAMO_REGION,
			});

			// Provide base params as input
			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				AttributesToGet: ["queue"],
				ReturnValues: "ALL_NEW",
			};

			// DynamoDB getPullRequest request
			const result = await dynamoDB.get(params).promise();
			const item = result.Item;
			if (item === undefined) {
				throw new Error(
					`User ${slackUser.Slack_Name} queue with ID ${slackUser.Slack_Id} not found`,
				);
			}

			// Return queue for user
			return item.queue;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async getMessageIds(
		dynamoTableName: string,
		slackUser: SlackUser,
	): Promise<string[]> {
		try {
			logger.info(`Getting message ids for User: ${slackUser.Slack_Name}`);

			//Setup/Init DocumentClient for DynamoDB
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				region: requiredEnvs.DYNAMO_REGION,
			});

			// Provide base params as input
			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				AttributesToGet: ["messageIds"],
				ReturnValues: "ALL_NEW",
			};

			// DynamoDB getMessageId request
			const result = await dynamoDB.get(params).promise();
			const item = result.Item;
			if (item === undefined) {
				throw new Error(
					`User ${slackUser.Slack_Name}'s queue with ID ${slackUser.Slack_Id} not found`,
				);
			}

			// Return message Ids
			return item.messageIds;
		} catch (error) {
			logger.error(
				`Error processing dynamo request for user: ${slackUser.Slack_Name}}`,
			);
			throw new Error(error.message);
		}
	}
}
