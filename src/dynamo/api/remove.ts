import { DynamoDB } from "aws-sdk";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";
import { PullRequest, SlackUser } from "../../models";

const logger = newLogger("DynamoRemove");

export class DynamoRemove {
	/**
	 * @description Remove PR from slack user's queue
	 * @param dynamoTableName Name of the dynamo table
	 * @param slackUserId Slack user Id
	 * @param currentQueue Current queue for slack user
	 * @param removePullRequest PR to remove from queue
	 */
	async removePullRequest(
		dynamoTableName: string,
		slackUser: SlackUser,
		currentQueue: PullRequest[],
		removePullRequest: PullRequest,
	): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {
		// Remove removePullRequest from currentQueue
		const newQueue = currentQueue.filter((pr: PullRequest) => {
			return pr.url !== removePullRequest.url;
		});

		try {
			logger.info(`Removing a PR from user ${slackUser.Slack_Name}'s queue`);

			// Setup/Init DocumentClient for Dynamo
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				region: requiredEnvs.DYNAMO_REGION,
			});

			// Provide base params as input
			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				UpdateExpression: `set queue = :d`,
				ExpressionAttributeValues: {
					":d": newQueue,
				},
			};

			// Dynamo deletePullRequest request
			const result = await dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}
