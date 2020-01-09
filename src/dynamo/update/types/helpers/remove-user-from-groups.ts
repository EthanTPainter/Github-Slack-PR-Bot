import { PullRequest, SlackUser } from "../../../../models";

/**
 * @description Remove User from all groups
 * @param pr Pull Request
 * @param user Slack User
 */
export function removeUserFromGroups(
	pr: PullRequest,
	user: SlackUser,
): PullRequest {
	// Remove user from standard alerts
	const standardLeadAlerts = (pr.standard_leads_alert || []).filter((lead) => {
		return lead.Slack_Id !== user.Slack_Id;
	});
	const standardMemberAlerts = (pr.standard_members_alert || []).filter(
		(member) => {
			return member.Slack_Id !== user.Slack_Id;
		},
	);

	// Remove user from req changes alerts
	const reqChangesLeadAlerts = (pr.req_changes_leads_alert || []).filter(
		(lead) => {
			return lead.Slack_Id !== user.Slack_Id;
		},
	);
	const reqChangesMemberAlerts = (pr.req_changes_members_alert || []).filter(
		(member) => {
			return member.Slack_Id !== user.Slack_Id;
		},
	);

	// Remove user from approving users
	const approvingLeads = (pr.leads_approving || []).filter((lead) => {
		return lead.Slack_Id !== user.Slack_Id;
	});
	const approvingMembers = (pr.members_approving || []).filter((member) => {
		return member.Slack_Id !== user.Slack_Id;
	});

	// Remove user from users requesting changes
	const leadsRequestingChanges = (pr.leads_req_changes || []).filter((lead) => {
		return lead.Slack_Id !== user.Slack_Id;
	});
	const membersRequestingChanges = (pr.members_req_changes || []).filter(
		(member) => {
			return member.Slack_Id !== user.Slack_Id;
		},
	);

	const newPR: PullRequest = {
		...pr,
		standard_leads_alert: standardLeadAlerts,
		standard_members_alert: standardMemberAlerts,
		req_changes_leads_alert: reqChangesLeadAlerts,
		req_changes_members_alert: reqChangesMemberAlerts,
		leads_approving: approvingLeads,
		members_approving: approvingMembers,
		leads_req_changes: leadsRequestingChanges,
		members_req_changes: membersRequestingChanges,
	};
	return newPR;
}
