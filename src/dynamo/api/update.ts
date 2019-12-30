import { DynamoDB } from "aws-sdk";
import { PullRequest, SlackUser } from "../../models";
import { newLogger } from "../../../src/logger";
import { requiredEnvs } from "../../../src/required-envs";

const logger = newLogger("DynamoUpdate");

export class DynamoUpdate {
	/**
	 * @description Update Pull Request to include latest action.
	 *              i.e. Approved, Commented, Changes requested, etc.
	 * @param dynamoTableName Name of the dynamo table
	 * @param slackUser Slack User
	 * @param currentQueue Slack User's current queue
	 * @param updatedPR Updated PR to add to queue
	 */
	async updatePullRequest(
		dynamoTableName: string,
		slackUser: SlackUser,
		currentQueue: PullRequest[],
		updatedPR: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		const newQueue = currentQueue.filter((pr: PullRequest) => {
			return pr.url !== updatedPR.url;
		});
		newQueue.push(updatedPR);

		try {
			logger.info(
				`Updating PR with url: ${updatedPR.url} for user ${slackUser.Slack_Name}`,
			);

			// Setup
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				region: requiredEnvs.DYNAMO_REGION,
			});

			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				UpdateExpression: `set queue = :d`,
				ExpressionAttributeValues: {
					":d": newQueue,
				},
			};

			// DynamoDB putItem request
			const result = await dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * @description Update message ids
	 * @param dynamoTableName Name of the Dynamo table
	 * @param slackUser Slack User
	 * @param updatedMessageIds Slack User's updated message ids
	 */
	async updateMessageIds(
		dynamoTableName: string,
		slackUser: SlackUser,
		updatedMessageIds: string[],
	) {
		try {
			logger.info(`Updating message ids for user: ${slackUser.Slack_Name}`);

			// Setup
			const dynamoDB = new DynamoDB.DocumentClient({
				apiVersion: requiredEnvs.DYNAMO_API_VERSION,
				convertEmptyValues: true,
			});

			const params = {
				TableName: dynamoTableName,
				Key: { slackUserId: slackUser.Slack_Id },
				UpdateExpression: `set messageIds = :d`,
				ExpressionAttributeValues: {
					":d": updatedMessageIds,
				},
			};

			const result = dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			logger.error(
				`Error updating the message ids for ${slackUser.Slack_Name}`,
			);
			throw new Error(error.message);
		}
	}
}
