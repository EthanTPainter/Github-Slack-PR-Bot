import { JSONConfig, SynchronizePR } from "../../../../../src/models";
import { newLogger } from "../../../../../src/logger";
import {
	getOwner,
	getTitle,
	getPRLink,
	getRepositoryName,
} from "../../../../../src/github/parse";
import {
	getSlackUser,
	getTeamOptionsAlt,
	getSlackGroup,
} from "../../../../../src/json/parse";
import { DynamoGet } from "../../../../../src/dynamo/api";
import { findPrInQueues } from "../../../../../src/dynamo/update/types/helpers";

const logger = newLogger("constructSynchronize");

/**
 * @description Construct synchronize event slack message string (Push events to a PR)
 * @param event GitHub Event
 * @param json JSON Config file
 * @param dynamoTableName The dynamo table name
 */
export async function constructSynchronize(
	event: any,
	json: JSONConfig,
	dynamoTableName: string,
): Promise<SynchronizePR> {
	// Synchronize Properties
	const owner = getOwner(event);
	const repoName = getRepositoryName(event);
	const team = getSlackGroup(owner, json);
	const slackUser = getSlackUser(owner, json);

	// Get team options to get fresh approval settings
	const teamOptions = getTeamOptionsAlt(slackUser, json);
	const eventPrUrl = getPRLink(event);

	// Get queue for the owner to see current approvals
	const dynamo = new DynamoGet();
	const userQueue = await dynamo.getQueue(dynamoTableName, slackUser);
	const teamQueue = await dynamo.getQueue(dynamoTableName, team);

	const pr = findPrInQueues(eventPrUrl, slackUser, userQueue, team, teamQueue);

	// Assuming the PR is found, check team options whether to alert
	const alert =
		teamOptions.Require_Fresh_Approvals &&
		teamOptions.Fresh_Approval_Repositories.includes(repoName) &&
		(pr.leads_approving.length > 0 || pr.members_approving.length > 0)
			? true
			: false;

	// If alert is true, set to any members and leads approving. Otherwise set to empty
	const reset_approving_users = alert
		? pr.leads_approving.concat(pr.members_approving)
		: [];

	// Base properties
	const description = `Fresh approvals are required on this PR`;
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
