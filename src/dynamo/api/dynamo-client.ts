import { DynamoDB } from "aws-sdk";

import { PullRequest } from "../../models";
import { newLogger } from "../../logger";
import { requiredEnvs } from "../../required-envs";

const logger = newLogger("DynamoClient");

interface IDynamoClient {
	getQueue(): Promise<PullRequest[]>;
	resetQueue(): Promise<DynamoDB.DocumentClient.UpdateItemOutput>;

	appendPullRequest(
		currentQueue: PullRequest[],
		newPullRequest: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput>;

	updatePullRequest(
		currentQueue: PullRequest[],
		updatedPR: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput>;

	removePullRequest(
		currentQueue: PullRequest[],
		removePullRequest: PullRequest,
	): Promise<DynamoDB.DocumentClient.DeleteItemOutput>;
}

export class DynamoClient implements IDynamoClient {
	private dynamoDB: DynamoDB.DocumentClient;
	private dynamoTableName: string;
	private slackUserId: string;

	constructor(dynamoTableName: string, slackUserId: string) {
		this.dynamoDB = new DynamoDB.DocumentClient({
			apiVersion: requiredEnvs.DYNAMO_API_VERSION,
			region: requiredEnvs.DYNAMO_REGION,
		});
		this.dynamoTableName = dynamoTableName;
		this.slackUserId = slackUserId;
	}

	/**
	 * @description Get the queue for a slack user
	 */
	async getQueue(): Promise<PullRequest[]> {
		try {
			logger.info(`Getting Queue for User ID: ${this.slackUserId}`);

			// Provide base params as input
			const params = {
				TableName: this.dynamoTableName,
				Key: { slackUserId: this.slackUserId },
				AttributesToGet: ["queue"],
				ReturnValues: "ALL_NEW",
			};

			const result = await this.dynamoDB.get(params).promise();
			const item = result.Item;
			if (item === undefined) {
				throw new Error(`User ID ${this.slackUserId} queue not found`);
			}

			// Return queue for user
			return item.queue;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * @description Reset the queue for a slack user
	 */
	async resetQueue(): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		try {
			logger.info(`Resetting queue for User ID: ${this.slackUserId}`);

			// Construct empty PullRequest
			const emptyPullRequest: PullRequest[] = [];

			// Provide base params as input
			const params = {
				TableName: this.dynamoTableName,
				Key: { slackUserId: this.slackUserId },
				UpdateExpression: `set queue = :d`,
				ExpressionAttributeValues: {
					":d": emptyPullRequest,
				},
			};

			const result = await this.dynamoDB.update(params).promise();
			if (result === undefined) {
				throw new Error(`User ID ${this.slackUserId} queue not found`);
			}

			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * @description Appends a new pull request to the current queue
	 * @param currentQueue Current queue of pull requests for a slack user
	 * @param newPullRequest New pull request to add to the queue
	 */
	async appendPullRequest(
		currentQueue: PullRequest[],
		newPullRequest: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		try {
			logger.info(`Appending new PR to User ID: ${this.slackUserId}'s queue`);

			// Append new PullRequest with any existing PullRequests
			currentQueue.push(newPullRequest);

			// Provide base params as input
			const params = {
				TableName: this.dynamoTableName,
				Key: { slackUserId: this.slackUserId },
				UpdateExpression: `set queue = :d`,
				ExpressionAttributeValues: {
					":d": currentQueue,
				},
			};

			const result = await this.dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * @description Update pull request to include latest action
	 * @param currentQueue Slack user's current queue
	 * @param updatedPR Updated PR to add to queue
	 */
	async updatePullRequest(
		currentQueue: PullRequest[],
		updatedPR: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		const newQueue = currentQueue.filter((pr: PullRequest) => {
			return pr.url !== updatedPR.url;
		});
		newQueue.push(updatedPR);

		try {
			logger.info(
				`Updating PR with url: ${updatedPR.url} for User ID: ${this.slackUserId}`,
			);

			const params = {
				TableName: this.dynamoTableName,
				Key: { slackUserId: this.slackUserId },
				UpdateExpression: `set queue = :queue`,
				ExpressionAttributeValues: {
					":queue": newQueue,
				},
			};

			const result = await this.dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * @description Remove pull request from slack user's queue
	 * @param currentQueue Current queue for slack user
	 * @param removePullRequest Pull request to remove from the queue
	 */
	async removePullRequest(
		currentQueue: PullRequest[],
		removePullRequest: PullRequest,
	): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
		// Remove removePullRequest from currentQueue
		const newQueue = currentQueue.filter((pr: PullRequest) => {
			return pr.url !== removePullRequest.url;
		});

		try {
			logger.info(`Removing a PR from User ID: ${this.slackUserId}'s queue`);

			// Provide base params as input
			const params = {
				TableName: this.dynamoTableName,
				Key: { slackUserId: this.slackUserId },
				UpdateExpression: `set queue = :d`,
				ExpressionAttributeValues: {
					":d": newQueue,
				},
			};

			const result = await this.dynamoDB.update(params).promise();
			return result;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}
