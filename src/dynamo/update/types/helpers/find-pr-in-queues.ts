import { PullRequest, SlackUser } from "../../../../models";

/**
 * @description Find PR in User or Team Queues
 * @param prUrl PR URL
 * @param userQueue A User's queue
 * @param teamQueue A team team queue
 * until the PR is found
 */
export function findPrInQueues(
	prUrl: string,
	user: SlackUser,
	userQueue: PullRequest[],
	team: SlackUser,
	teamQueue: PullRequest[],
): PullRequest {
	// Search for PR in user's queue
	const userQueuePR = userQueue.find((pr) => pr.url === prUrl);
	if (userQueuePR) {
		return userQueuePR;
	}

  // If not in user queue, search team queue
	const teamQueuePR = teamQueue.find((pr) => pr.url === prUrl);
	if (teamQueuePR) {
		return teamQueuePR;
	}

	// If PR is not in user or user's team queue, not sure where else to look...
	// Throw an error since there isn't enough context to do enough here
	throw new Error(
		`GitHub PR Url: ${prUrl} not found in ${user.Slack_Name}'s queue OR ${team.Slack_Name}'s queue`,
	);
}
