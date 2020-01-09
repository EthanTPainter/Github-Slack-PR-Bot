import {
	PullRequest,
	SlackUser,
	Event,
	TeamOptions,
	JSONConfig,
} from "../../../../models";
import { removeUserFromGroups } from "./remove-user-from-groups";
import { checkIfUserIsMember, checkIfUserIsLead } from "./check-user-role";
import { getStandardMemberAlerts } from "./get-standard-member-alerts";
import { getStandardLeadAlerts } from "./get-standard-lead-alerts";
import { getLeftoverMembers } from "./get-leftover-members";
import { getLeftoverLeads } from "./get-leftover-leads";

/**
 * @description Update PR when changes are requested
 * @param prOwner PR Owner
 * @param prApprover
 * @param dynamoTableName
 * @param event
 * @param json
 */
export function updatePrOnChangesRequested(
	owner: SlackUser,
	userRequestingChanges: SlackUser,
	userIsMember: boolean,
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
	const updatedPR = removeUserFromGroups(initialPr, userRequestingChanges);

	const leadsReqChanges = updatedPR.leads_req_changes;
	const membersReqChanges = updatedPR.members_req_changes;

	// Construct new approving user lists
	userIsMember
		? membersReqChanges.push(userRequestingChanges)
		: leadsReqChanges.push(userRequestingChanges);

	/*
	 * Set new member and lead complete to false if the following is true
	 * member complete is true AND user is a member
	 *                    OR
	 * lead complete is true AND user is not a member
	 */
	const memberComplete =
		updatedPR.member_complete && userIsMember
			? false
			: updatedPR.member_complete;
	const leadComplete =
		updatedPR.lead_complete && !userIsMember ? false : updatedPR.lead_complete;

	// Add new event
	const events = initialPr.events;
	events.push(newEvent);

	// Create new standard lead and member alerts
	const ownerIsLead = checkIfUserIsLead(owner, json);
	const userReqChangesIsLead = checkIfUserIsLead(userRequestingChanges, json);
	const newStandardMemberAlerts = getStandardMemberAlerts(
		owner,
		ownerIsLead,
		userRequestingChanges,
		userReqChangesIsLead,
		false,
		updatedPR.standard_members_alert,
		updatedPR.members_approving,
		membersReqChanges,
		updatedPR.req_changes_members_alert,
		teamOptions,
	);
	const newStandardLeadAlerts = getStandardLeadAlerts(
		owner,
		ownerIsLead,
		userRequestingChanges,
		userReqChangesIsLead,
		false,
		memberComplete,
		updatedPR.standard_leads_alert,
		newStandardMemberAlerts,
		updatedPR.req_changes_members_alert,
		updatedPR.leads_approving,
		leadsReqChanges,
		updatedPR.req_changes_leads_alert,
		teamOptions,
	);

	// Get leftover leads and members
	const leftoverMembers = getLeftoverMembers(
		initialPr.standard_members_alert,
		newStandardMemberAlerts,
		userRequestingChanges,
	);
	const leftoverLeads = getLeftoverLeads(
		initialPr.standard_leads_alert,
		newStandardLeadAlerts,
		userRequestingChanges,
	);

	/*
	 // Check whether there are leftover leads to stop alerting
	 // Leads requesting changes + lead alerted for fixed pr + leads approving >= team option for required lead approvals
	 // save as true (remove existing leads). Otherwise, save as false (No leads to remove)
	 const removeLeads =
		leadsReqChanges.length +
			updatedPR.req_changes_leads_alert.length +
			updatedPR.leads_approving.length >=
		teamOptions.Num_Required_Lead_Approvals
			? true
			: false;

	 // Check whether there are leftover members to stop alerting
	 // Members requesting changes + members alerted for fixed pr + members approving >= team option for required member approvals
	 // save as true (remove existing members). Otherwise, save as false (no members to remove)
	 const removeMembers =
		membersReqChanges.length +
			updatedPR.req_changes_members_alert.length +
			updatedPR.members_approving.length >=
		teamOptions.Num_Required_Member_Approvals
			? true
			: false;

	// Add pr owner to standard lead or members alert (depending on which the user is from)
	const ownerIsMember = checkIfUserIsMember(owner, json);
	const ownerInStandardLeadAlerting = updatedPR.standard_leads_alert.find(
		(lead) => {
			return lead.Slack_Id === owner.Slack_Id;
		},
	);
	const ownerInStandardMemberAlerting = updatedPR.standard_members_alert.find(
		(member) => {
			return member.Slack_Id === owner.Slack_Id;
		},
	);
	if (ownerIsMember) {
		ownerInStandardMemberAlerting
			? updatedPR.standard_members_alert
			: updatedPR.standard_members_alert.push(owner);
	} else {
		ownerInStandardLeadAlerting
			? updatedPR.standard_leads_alert
			: updatedPR.standard_leads_alert.push(owner);
	}

	// Construct new standard alerts
	const newStandardLeadAlerts: SlackUser[] = [];
	const newStandardMemberAlerts: SlackUser[] = [];
	// Check if standard leads alerted are removed
	if (removeLeads) {
		// Check if the PR owner is a lead
		if (!ownerIsMember) {
			newStandardLeadAlerts.push(owner);
		}
	} else {
		updatedPR.standard_leads_alert.forEach((lead) => {
			newStandardLeadAlerts.push(lead);
		});
	}

	if (removeMembers) {
		if (ownerIsMember) {
			newStandardMemberAlerts.push(owner);
		}
	} else {
		updatedPR.standard_members_alert.forEach((member) => {
			newStandardMemberAlerts.push(member);
		});
	}
	*/

	// New updated PR model
	const newPR: PullRequest = {
		...updatedPR,
		events,
		lead_complete: leadComplete,
		member_complete: memberComplete,
		leads_req_changes: leadsReqChanges,
		members_req_changes: membersReqChanges,
		// If remove leads is true, save an empty array. If false, save the standard leads alert
		standard_leads_alert: newStandardLeadAlerts,
		standard_members_alert: newStandardMemberAlerts,
	};

	return {
		pr: newPR,
		leftoverLeads,
		leftoverMembers,
	};

	/*
	return {
		pr: newPR,
		leftoverLeads: removeLeads ? updatedPR.standard_leads_alert : [],
		leftoverMembers: removeMembers ? updatedPR.standard_members_alert : [],
	};
	*/
}
