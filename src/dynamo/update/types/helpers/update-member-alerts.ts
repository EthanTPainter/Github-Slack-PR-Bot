import { getSlackLeadsAlt, getSlackMembersAlt } from "../../../../json/parse";
import {
	PullRequest,
	SlackUser,
	TeamOptions,
	JSONConfig,
} from "../../../../models";
import { DynamoGet, DynamoRemove } from "../../../api";

/**
 * @description Update member complete & members to alert
 * @param pr Pull request to change
 * @param slackUserOwner Slack user owner of the PR
 * @param slackUserChanging Slack user changing the status
 *                          of the PR by approving or
 *                          requesting changes
 * @param teamOptions Team Options
 * @param isApproving Whether the slackUserChanging is
 *                    approving the PR or requesting
 *                    changes
 * @param dynamoTableName Name of the dynamo table
 * @param json JSON config file
 */
export async function updateMemberAlerts(
	pr: PullRequest,
	slackUserOwner: SlackUser,
	slackUserChanging: SlackUser,
	teamOptions: TeamOptions,
	isApproving: boolean,
	dynamoTableName: string,
	json: JSONConfig,
): Promise<{ pr: PullRequest; leftMembers: SlackUser[] }> {
	// Setup
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();

	// Keep track of members who no longer need to be alerted
	const leftoverAlertedMembers: SlackUser[] = [];

	if (isApproving) {
		// Filter out user from req_changes or req changes alerts
		pr.members_req_changes = pr.members_req_changes.filter((member) => {
			return member !== slackUserChanging;
		});
		pr.req_changes_members_alert = pr.req_changes_members_alert.filter(
			(member) => {
				return member !== slackUserChanging;
			},
		);
		// Check if there are any members or leads requesting changes to the PR
		// AND if the pr owner is in the standard member or leads alerted
		if (
			pr.leads_req_changes.length === 0 &&
			pr.members_req_changes.length === 0 &&
			pr.req_changes_leads_alert.length === 0 &&
			pr.req_changes_members_alert.length === 0 &&
			(pr.standard_leads_alert.includes(slackUserOwner) ||
				pr.standard_members_alert.includes(slackUserOwner))
		) {
			pr.standard_leads_alert = pr.standard_leads_alert.filter((lead) => {
				return lead !== slackUserOwner;
			});
			pr.standard_members_alert = pr.standard_members_alert.filter((member) => {
				return member !== slackUserOwner;
			});
			// Remove slackUserOwner alerted in queue
			const ownerQueue = await dynamoGet.getQueue(
				dynamoTableName,
				slackUserOwner,
			);
			await dynamoRemove.removePullRequest(
				dynamoTableName,
				slackUserOwner,
				ownerQueue,
				pr,
			);
		}
		pr.members_approving.push(slackUserChanging);
	} else {
		pr.members_req_changes.push(slackUserChanging);
		// Check if slackUserOwner is a lead or member
		let ownerLead = false;
		let ownerMember = false;
		const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
		const slackMembers = getSlackMembersAlt(slackUserOwner, json);
		slackLeads.map((lead) => {
			if (lead === slackUserOwner) {
				ownerLead = true;
			}
		});
		slackMembers.map((member) => {
			if (member.Slack_Id === slackUserOwner.Slack_Id) {
				ownerMember = true;
			}
		});
		if (ownerLead && ownerMember) {
			throw new Error(`${slackUserOwner} set as a member and lead. Pick one!`);
		}
		// Check if slackUserOwner is already in standard_leads_alert
		if (ownerLead) {
			if (!pr.standard_leads_alert.includes(slackUserOwner)) {
				pr.standard_leads_alert.push(slackUserOwner);
			}
		}
		// Check if slackUserOwner is already in standard_members_alert
		if (ownerMember) {
			if (!pr.standard_members_alert.includes(slackUserOwner)) {
				pr.standard_members_alert.push(slackUserOwner);
			}
		}
		// Check if lead has preivously approved the PR
		// If found, remove lead from approving leads
		if (pr.members_approving.includes(slackUserChanging)) {
			pr.members_approving = pr.members_approving.filter((member) => {
				return member !== slackUserChanging;
			});
		}
	}

	// AND members approving + members requesting changes >= required member approvals
	// Then add slackId
	if (
		pr.members_approving.length +
			pr.members_req_changes.length +
			pr.req_changes_members_alert.length >=
		teamOptions.Num_Required_Member_Approvals
	) {
		// Store leftover members
		pr.standard_members_alert.map((slackUser) => {
			if (slackUser !== slackUserChanging && slackUser !== slackUserOwner) {
				leftoverAlertedMembers.push(slackUser);
			}
		});
		// If members alert includes pr owner, keep owner alerted
		if (pr.standard_members_alert.includes(slackUserOwner)) {
			pr.standard_members_alert = [slackUserOwner];
		} else {
			pr.standard_members_alert = [];
		}
		// If any members are requesting changes, not member complete
		if (
			pr.req_changes_members_alert.length > 0 ||
			pr.members_req_changes.length > 0
		) {
			// Check if leads were alerted after members complete were true
			if (teamOptions.Member_Before_Lead && pr.member_complete) {
				// Remove all standard leads alerted (except pr owner)
				const unalertedLeadIds: SlackUser[] = [];
				pr.standard_leads_alert = pr.standard_leads_alert.filter((lead) => {
					if (lead !== pr.owner) {
						unalertedLeadIds.push(lead);
					}
					return lead === pr.owner;
				});
				await Promise.all(
					unalertedLeadIds.map(async (unalertedLeadId) => {
						const currentQueue = await dynamoGet.getQueue(
							dynamoTableName,
							unalertedLeadId,
						);
						await dynamoRemove.removePullRequest(
							dynamoTableName,
							unalertedLeadId,
							currentQueue,
							pr,
						);
					}),
				);
			}
			pr.member_complete = false;
		} else if (
			pr.members_approving.length < teamOptions.Num_Required_Member_Approvals
		) {
			pr.member_complete = false;
		} else {
			pr.member_complete = true;
			// If members before leads, created list for standard_leads_alert
			if (teamOptions.Member_Before_Lead) {
				// Check if leads are already complete
				if (pr.lead_complete === true) {
					// Do nothing
				}
				// If # of leads approving or requesting changes
				// meets or exceeds Required lead approvals
				else if (
					pr.leads_req_changes.length +
						pr.req_changes_leads_alert.length +
						pr.leads_approving.length >
					teamOptions.Num_Required_Lead_Approvals
				) {
					// Do nothing
				}
				// Otherwise can alert leads
				else {
					const currentApprovingLeads = pr.leads_approving;
					const currentReqChangesLeads = pr.leads_req_changes.concat(
						pr.req_changes_leads_alert,
					);
					const allSlackLeads = getSlackLeadsAlt(slackUserOwner, json);
					allSlackLeads.map((lead) => {
						// Check if slackLead is already requesting changes or approving the PR
						if (
							currentApprovingLeads.includes(lead) ||
							currentReqChangesLeads.includes(lead)
						) {
							// Do nothing
						} else {
							pr.standard_leads_alert.push(lead);
						}
					});
				}
			}
		}
	}
	// Otherwise don't have enough members approving/requesting changes
	// OR just approving. Construct new list of members to alert
	else {
		const newMembersToAlert = pr.standard_members_alert.filter((slackUser) => {
			return slackUser !== slackUserChanging;
		});
		pr.standard_members_alert = newMembersToAlert;
	}

	return { pr: pr, leftMembers: leftoverAlertedMembers };
}
