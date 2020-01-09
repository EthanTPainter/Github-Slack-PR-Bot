import {
	PullRequest,
	SlackUser,
	Event,
	TeamOptions,
	JSONConfig,
} from "../../../../models";
import { removeUserFromGroups } from "./remove-user-from-groups";
import { getSlackLeadsAlt } from "../../../../json/parse";
import { checkIfUserIsLead } from "./check-user-role";
import { getStandardLeadAlerts } from "./get-standard-lead-alerts";
import { getStandardMemberAlerts } from "./get-standard-member-alerts";
import { getLeftoverLeads } from "./get-leftover-leads";
import { getLeftoverMembers } from "./get-leftover-members";

/**
 * @description Update PR when approved
 * @param prOwner Slack User of the PR Owner
 * @param prApprover Slack User of the PR Approver
 * @param userApprovingIsMember Whether the user approving the PR is a member
 * @param dynamoTableName Dynamo Table name
 * @param event New PR Event
 * @param json JSON Config
 */
export function updatePrOnApprove(
	prOwner: SlackUser,
	prApprover: SlackUser,
	userApprovingIsMember: boolean,
	teamOptions: TeamOptions,
	initialPr: PullRequest,
	newEvent: Event,
	json: JSONConfig,
): {
	pr: PullRequest;
	leftoverLeads: SlackUser[];
	leftoverMembers: SlackUser[];
} {
	// Remove user from PR groups
	const updatedPR = removeUserFromGroups(initialPr, prApprover);

	const approvingLeads = updatedPR.leads_approving;
	const approvingMembers = updatedPR.members_approving;

	// Add PR approver to new approving user lists
	userApprovingIsMember
		? approvingMembers.push(prApprover)
		: approvingLeads.push(prApprover);

	/**
	 * If the following conditions are met, set member_complete to true
	 * member_complete is already true
	 *            OR
	 * user approving is a member
	 *           AND
	 * the # of members approving > # of required member approvals
	 *           AND
	 * the # of leads requesting changes is zero
	 *           AND
	 * the # of leads alerted about a fixed PR is zero
	 */
	const memberComplete =
		updatedPR.member_complete ||
		(userApprovingIsMember &&
			approvingMembers.length >= teamOptions.Num_Required_Member_Approvals &&
			updatedPR.members_req_changes.length === 0 &&
			updatedPR.req_changes_members_alert.length === 0)
			? true
			: false;

	/**
	 * If the following conditions are met, set lead_complete to true
	 * lead_complete is already true
	 *           OR
	 * user approving is a lead
	 *          AND
	 * the # of leads approving > # of required lead approvals
	 *          AND
	 * the # of leads requesting changes is zero
	 *          AND
	 * the # of leads alerted about a fixed PR is zero
	 */
	const leadComplete =
		updatedPR.lead_complete ||
		(!userApprovingIsMember &&
			approvingLeads.length >= teamOptions.Num_Required_Lead_Approvals &&
			updatedPR.leads_req_changes.length === 0 &&
			updatedPR.req_changes_leads_alert.length === 0)
			? true
			: false;

	// Add new event
	const events = initialPr.events;
	events.push(newEvent);

	/**
	 * Check whether to add all team leads to standard lead alerting
	 * If the team option Member Before Lead is true
	 *                     AND
	 * If the user approving is a member
	 *                     AND
	 * If lead complete is false
	 *                     AND
	 * If the inital PR had a member complete false
	 *                     AND
	 * The leads requsting changes + leads alerted for fixed pr + leads approving < team option of required lead approvals
	 *                     AND
	 * The new PR has member complete true
	 */
	const alertTeamLeads =
		teamOptions.Member_Before_Lead &&
		userApprovingIsMember &&
		!leadComplete &&
		!initialPr.member_complete &&
		updatedPR.leads_req_changes.length +
			updatedPR.req_changes_leads_alert.length +
			updatedPR.leads_approving.length <
			teamOptions.Num_Required_Lead_Approvals &&
		memberComplete
			? true
			: false;

	if (alertTeamLeads) {
		const teamLeads = getSlackLeadsAlt(prOwner, json);
		updatedPR.standard_leads_alert = teamLeads;
	}

	// Create new standard lead and member alerts
	const prOwnerIsLead = checkIfUserIsLead(prOwner, json);
	const prApproverIsLead = checkIfUserIsLead(prApprover, json);

	const newStandardMemberAlerts = getStandardMemberAlerts(
		prOwner,
		prOwnerIsLead,
		prApprover,
		prApproverIsLead,
		true,
		updatedPR.standard_members_alert,
		approvingMembers,
		updatedPR.members_req_changes,
		updatedPR.req_changes_members_alert,
		teamOptions,
	);
	const newStandardLeadAlerts = getStandardLeadAlerts(
		prOwner,
		prOwnerIsLead,
		prApprover,
		prApproverIsLead,
		true,
		memberComplete,
		updatedPR.standard_leads_alert,
		newStandardMemberAlerts,
		updatedPR.req_changes_members_alert,
		approvingLeads,
		updatedPR.leads_req_changes,
		updatedPR.req_changes_leads_alert,
		teamOptions,
	);

	// Get leftover leads and members
	const leftoverMembers = getLeftoverMembers(
		initialPr.standard_members_alert,
		newStandardMemberAlerts,
		prApprover,
	);
	const leftoverLeads = getLeftoverLeads(
		initialPr.standard_leads_alert,
		newStandardLeadAlerts,
		prApprover,
	);

	// New updated PR model
	const newPR: PullRequest = {
		...updatedPR,
		events,
		lead_complete: leadComplete,
		member_complete: memberComplete,
		leads_approving: approvingLeads,
		members_approving: approvingMembers,
		standard_leads_alert: newStandardLeadAlerts,
		standard_members_alert: newStandardMemberAlerts,
	};

	return {
		pr: newPR,
		leftoverLeads: leftoverLeads,
		leftoverMembers: leftoverMembers,
	};
}
