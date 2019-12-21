import { PullRequest } from "../../models";
import { newLogger } from "../../logger";
import { getTeamOptionsAlt } from "../../json/parse";
import { constructQueueString } from "../../slack/message/construct/description";
import { SlackUser } from "../../models";

const logger = newLogger("FormatMyQueue");

/**
 * @description Format a queue from a raw DynamoDB stored
 * array into a stringified version to present on Slack
 * @returns String of the DynamoDB queue
 */
export function formatMyQueue(
	submittedUserId: string,
	owner: SlackUser,
	queue: PullRequest[],
	json: any,
): string {
	let formattedQueue = "";

	// If the queue is empty
	if (queue.length === 0) {
		formattedQueue =
			submittedUserId === owner.Slack_Id
				? "Nothing found in your queue"
				: `Nothing found in ${owner.Slack_Name}'s queue`;
		return formattedQueue;
	}
	formattedQueue = `*${owner.Slack_Name}'s Queue*\n`;

	// If the queue has contents, display them sorted:
	queue.map((pr: PullRequest) => {
		const options = getTeamOptionsAlt(pr.owner, json);
		formattedQueue += constructQueueString(pr, options);
	});
	logger.info(`Formatted Queue: ${formattedQueue}`);

	return formattedQueue;
}
