import { JSONConfig, SynchronizePR } from "../../../../../src/models";
import { newLogger } from "../../../../../src/logger";
import {
	getOwner,
	getTitle,
	getPRLink,
	getRepositoryName,
} from "../../../../../src/github/parse";
import { getSlackUser, getTeamOptionsAlt } from "../../../../../src/json/parse";
import { DynamoGet } from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";

const logger = newLogger("constructSynchronize");

/**
 * @description Construct synchronize event slack message string (Push events to a PR)
 * @param event GitHub Event
 * @param json JSON Config file
 */
export async function constructSynchronize(
	event: any,
	json: JSONConfig,
): Promise<SynchronizePR> {
	// Synchronize Properties
	const owner = getOwner(event);
	const repoName = getRepositoryName(event);
	const slackUser = getSlackUser(owner, json);

	// Get team options to get fresh approval settings
	const teamOptions = getTeamOptionsAlt(slackUser, json);

	// Get queue for the owner to see current approvals
	const dynamo = new DynamoGet();
	const userQueue = await dynamo.getQueue(
		requiredEnvs.DYNAMO_TABLE_NAME,
		slackUser,
	);
	const eventPrUrl = getPRLink(event);
	const userPr = userQueue.find((pullRequest) => {
		return pullRequest.url === eventPrUrl;
	});

	// If for some reason the pr is not found in the user's queue, ignore the synchronize event
	if (!userPr) {
		logger.error(
			`Unable to find pull request URL in ${slackUser.Slack_Name}'s queue`,
		);
		return {
			description: "",
			title: "",
			url: "",
			reset_approving_users: [],
			alert: false,
		};
	}

	// Assuming the PR is found, check team options whether to alert
	const alert =
		teamOptions.Require_Fresh_Approvals &&
		teamOptions.Fresh_Approval_Repositories.includes(repoName) &&
		(userPr.leads_approving.length > 0 || userPr.members_approving.length > 0)
			? true
			: false;

	// If alert is true, set to any members and leads approving. Otherwise set to empty
	const reset_approving_users = alert
		? userPr.leads_approving.concat(userPr.members_approving)
		: [];

	// Base properties
	const description = "";
	const title = getTitle(event);
	const url = getPRLink(event);

	// Construct SynchronizePR object
	const synchronizeObj: SynchronizePR = {
		description,
		title,
		url,
		reset_approving_users,
		alert,
	};

	logger.debug(`SynchronizePR: ${JSON.stringify(synchronizeObj)}`);

	return synchronizeObj;
}
