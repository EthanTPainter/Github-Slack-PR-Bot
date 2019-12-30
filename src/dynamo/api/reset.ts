import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { PullRequest, SlackUser } from "../../models";

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
		slackUser: SlackUser,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		try {
			logger.info(`Resetting queue for user ${slackUser.Slack_Name}`);

			// Construct empty PullRequest
			const emptyPullRequest: PullRequest[] = [];
			const emptyMessageIds: string[] = [];

			// Setup/Init DocumentClient for DynamoDB
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				region: requiredEnvs.DYNAMO_REGION,
			});

			// Provide base params as input
			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				UpdateExpression: `set queue = :d, messageIds = :mi`,
				ExpressionAttributeValues: {
					":d": emptyPullRequest,
					":mi": emptyMessageIds,
				},
			};

			// DynamoDB getPullRequest request
			const result = await dynamoDB.update(params).promise();
			if (result === undefined) {
				throw new Error(
					`User ${slackUser.Slack_Name} queue with ID ${slackUser.Slack_Id} not found`,
				);
			}

			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}
