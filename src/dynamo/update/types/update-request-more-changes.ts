import { SlackUser, JSONConfig, PullRequest } from "../../../models";
import { getSlackGroupAlt } from "../../../json/parse";
import { DynamoGet, DynamoUpdate, DynamoRemove } from "../../../dynamo/api";
import { checkIfUserIsLead } from "./helpers";

/**
 * @description Update PR when a user is requesting more changes
 * @param userRequestingChanges User requesting more changes
 * @param prUrl Pull request url
 * @param dynamoTableName Dynamo table name
 * @param json JSON config
 */
export async function updateRequestMoreChanges(
	userRequestingChanges: SlackUser,
	prUrl: string,
	dynamoTableName: string,
	json: JSONConfig,
): Promise<{ response: string; failure: boolean }> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoUpdate();
	const dynamoRemove = new DynamoRemove();

	// Get team queue using the user requesting changes as a starting point
	const team = getSlackGroupAlt(userRequestingChanges.Slack_Id, json);
	const teamQueue = await dynamoGet.getQueue(dynamoTableName, team);

	// Make sure PR is found in the team queue
	const foundPR = teamQueue.find((pr) => {
		return pr.url === prUrl;
	});
	if (!foundPR) {
		return {
			response: `Provided PR Url: ${prUrl} not found in ${team.Slack_Name}'s queue`,
			failure: true,
		};
	}

	/* Make sure the user requesting more changes is in one of the following groups:
	 * 1) leads_req_changes
	 * 2) members_req_changes
	 * 3) req_changes_lead_alerts
	 * 4) req_changes_member_alerts
	 */
	const foundInLeadsReqChanges = foundPR.leads_req_changes.find((lead) => {
		return lead.Slack_Id === userRequestingChanges.Slack_Id;
	});
	const foundInMembersReqChanges = foundPR.members_req_changes.find(
		(member) => {
			return member.Slack_Id === userRequestingChanges.Slack_Id;
		},
	);
	const foundInReqChangeLeadsAlert = foundPR.req_changes_leads_alert.find(
		(lead) => {
			return lead.Slack_Id === userRequestingChanges.Slack_Id;
		},
	);
	const foundInReqChangeMembersAlert = foundPR.req_changes_members_alert.find(
		(member) => {
			return member.Slack_Id === userRequestingChanges.Slack_Id;
		},
	);

	// If not found in any groups, don't change anything
	// User must first already be requesting changes before requesting more
	if (
		!foundInLeadsReqChanges &&
		!foundInMembersReqChanges &&
		!foundInReqChangeLeadsAlert &&
		!foundInReqChangeMembersAlert
	) {
		const invalidCommandUse = `To use this command, you must already be requesting changes or alerted about a fixed PR for ${prUrl}`;
		return {
			response: invalidCommandUse,
			failure: true,
		};
	}

	// Assuming the user requesting changes is requesting changes or alerted about a fixed PR
	// Check if the user requesting more changes is already requesting changes
	const newReqChangesLeadAlerts: SlackUser[] = [];
	const newReqChangesMemberAlerts: SlackUser[] = [];
	let newLeadsReqChanges: SlackUser[] = [];
	let newMembersReqChanges: SlackUser[] = [];
	let newStandardLeadAlerts: SlackUser[] = [];
	let newStandardMemberAlerts: SlackUser[] = [];

	if (foundInLeadsReqChanges) {
		const message = `${userRequestingChanges.Slack_Name} has requested more changes with ${prUrl}. Owner: ${foundPR.owner.Slack_Id}`;
		return {
			response: message,
			failure: false,
		};
	} else if (foundInMembersReqChanges) {
		const message = `${userRequestingChanges.Slack_Name} has requested more changes with ${prUrl}. Owner: ${foundPR.owner.Slack_Id}`;
		return {
			response: message,
			failure: false,
		};
	}

	// User must be alerted about a fixed PR, and is requesting changes to alert the owner
	else if (foundInReqChangeLeadsAlert) {
		// Remove user requesting changes from fixed PR alerting
		foundPR.req_changes_leads_alert.forEach((lead) => {
			lead.Slack_Id !== userRequestingChanges.Slack_Id
				? newReqChangesLeadAlerts.push(lead)
				: undefined;
		});

		// If the user requesting changes is a lead, add them to the leads req changes list
		// If the user requesting changes is a member, add them to the members req changes list
		const userReqChangesIsLead = checkIfUserIsLead(userRequestingChanges, json);
		if (userReqChangesIsLead) {
			newLeadsReqChanges = foundPR.standard_leads_alert.filter((lead) => {
				return lead.Slack_Id !== foundPR.owner.Slack_Id;
			});
			newLeadsReqChanges.push(foundPR.owner);
		} else {
			newMembersReqChanges = foundPR.standard_members_alert.filter((member) => {
				return member.Slack_Id !== userRequestingChanges.Slack_Id;
			});
			newMembersReqChanges.push(userRequestingChanges);
		}

		// If the PR Owner is a lead, add them to the leads standard alerting
		// If the PR Owner is a member, add them to the members standard alerting
		const ownerIsLead = checkIfUserIsLead(foundPR.owner, json);
		if (ownerIsLead) {
			newStandardLeadAlerts = foundPR.standard_leads_alert.filter((lead) => {
				return lead.Slack_Id !== foundPR.owner.Slack_Id;
			});
			newStandardLeadAlerts.push(foundPR.owner);
		} else {
			newStandardMemberAlerts = foundPR.standard_members_alert.filter(
				(member) => {
					return member.Slack_Id !== foundPR.owner.Slack_Id;
				},
			);
			newStandardMemberAlerts.push(foundPR.owner);
		}
	}
	// Otherwise, it must be a member who was alerted about a fixed pr
	else {
		// Remove user requesting changes from fixed PR alerting
		foundPR.req_changes_members_alert.forEach((member) => {
			member.Slack_Id !== userRequestingChanges.Slack_Id
				? newReqChangesMemberAlerts.push(member)
				: undefined;
		});

		// Make sure the user requesting changes is added to lead or member req changes
		const userReqChangesIsLead = checkIfUserIsLead(userRequestingChanges, json);
		if (userReqChangesIsLead) {
			newLeadsReqChanges = foundPR.standard_leads_alert.filter((lead) => {
				return lead.Slack_Id !== userRequestingChanges.Slack_Id;
			});
			newLeadsReqChanges.push(userRequestingChanges);
		} else {
			newMembersReqChanges = foundPR.standard_members_alert.filter((member) => {
				return member.Slack_Id !== userRequestingChanges.Slack_Id;
			});
			newMembersReqChanges.push(userRequestingChanges);
		}

		// Make sure the PR owner is added to standard lead or member alerting
		const ownerIsLead = checkIfUserIsLead(foundPR.owner, json);
		if (ownerIsLead) {
			newStandardLeadAlerts = foundPR.standard_leads_alert.filter((lead) => {
				return lead.Slack_Id !== foundPR.owner.Slack_Id;
			});
			newStandardLeadAlerts.push(foundPR.owner);
		} else {
			newStandardMemberAlerts = foundPR.standard_members_alert.filter(
				(member) => {
					return member.Slack_Id !== foundPR.owner.Slack_Id;
				},
			);
			newStandardMemberAlerts.push(foundPR.owner);
		}
	}

	// Make a new updated PR
	const updatedPR: PullRequest = {
		...foundPR,
		standard_leads_alert: newStandardLeadAlerts,
		standard_members_alert: newStandardMemberAlerts,
		leads_req_changes: newLeadsReqChanges,
		members_req_changes: newMembersReqChanges,
		req_changes_leads_alert: newReqChangesLeadAlerts,
		req_changes_members_alert: newReqChangesMemberAlerts,
	};

	// Update team queue
	await dynamoUpdate.updatePullRequest(
		dynamoTableName,
		team,
		teamQueue,
		updatedPR,
	);

	// Update queue for each person in the standard lead and member alerts, and
	// everyone is the req changes (fixed PR) lead and member alerts
	const updatedUsers = newStandardLeadAlerts
		.concat(newStandardMemberAlerts)
		.concat(newReqChangesLeadAlerts)
		.concat(newReqChangesMemberAlerts);

	const removedUsers = newLeadsReqChanges.concat(newMembersReqChanges);

	Promise.all(
		updatedUsers.map(async (user) => {
			const userQueue = await dynamoGet.getQueue(dynamoTableName, user);
			await dynamoUpdate.updatePullRequest(
				dynamoTableName,
				user,
				userQueue,
				updatedPR,
			);
		}),
	);

	// Remove the PR from the users who moved from Fixed PR alerting
	// to users requesting changes
	Promise.all(
		removedUsers.map(async (user) => {
			const userQueue = await dynamoGet.getQueue(dynamoTableName, user);
			await dynamoRemove.removePullRequest(
				dynamoTableName,
				user,
				userQueue,
				updatedPR,
			);
		}),
	);

	return {
		response: `${userRequestingChanges.Slack_Name} has requested changes on a previously fixed PR. Owner: ${updatedPR.owner.Slack_Id}`,
		failure: false,
	};
}
