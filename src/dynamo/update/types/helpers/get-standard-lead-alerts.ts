import { SlackUser, TeamOptions } from "../../../../models";

/**
 * @description Get standard lead alerts
 * @param prOwner Slack User of PR Owner
 * @param prOwnerIsLead If the Slack User is a lead
 * @param prChanger Slack User approving
 * @param prChangerIsLead If the Slack User is a lead
 * @param isApproving If the PR user changing is approving or requesting changes
 * @param memberComplete If the PR is member complete
 * @param standardLeadAlerts Current standardLeadAlerts
 * @param standardMemberAlerts Current standard member lead alerts
 * @param fixedPRMembers Fixed PR members alerted
 * @param leadsApproving Leads approving the PR
 * @param leadsReqChanges Leads requesting changes on the PR
 * @param fixedPRLeads Fied PR leads alerted
 * @param teamOptions Team Options
 */
export function getStandardLeadAlerts(
	prOwner: SlackUser,
	prOwnerIsLead: boolean,
	prChanger: SlackUser,
	prChangerIsLead: boolean,
	isApproving: boolean,
	memberComplete: boolean,
	standardLeadAlerts: SlackUser[],
	standardMemberAlerts: SlackUser[],
	fixedPRMembers: SlackUser[],
	leadsApproving: SlackUser[],
	leadsReqChanges: SlackUser[],
	fixedPRLeads: SlackUser[],
	teamOptions: TeamOptions,
): SlackUser[] {
	// If no lead approvals are required, don't alert any leads
	if (teamOptions.Num_Required_Lead_Approvals === 0) {
		return [];
	}

	// If team option Member Before Lead is true
	// and member complete is false, Don't alert any leads
	if (teamOptions.Member_Before_Lead && !memberComplete) {
		return [];
	}

	// If the PR is a lead and Approving and leads approving >= required lead approvals
	// and leads requesting changes is empty and fixed PR lead alerting is empty
	// Don't alert anymore leads
	if (
		prChangerIsLead &&
		isApproving &&
		leadsApproving.length >= teamOptions.Num_Required_Lead_Approvals &&
		leadsReqChanges.length === 0 &&
		fixedPRLeads.length === 0
	) {
		return [];
	}

	// If team option Member Before Lead is true
	// and member complete is true
	// and there are standard members or fixed PR member alerting
	if (
		teamOptions.Member_Before_Lead &&
		memberComplete &&
		(standardMemberAlerts.length !== 0 || fixedPRMembers.length !== 0)
	) {
		return [];
	}

	// If the prChanger is a member, return the standard leads
	if (!prChangerIsLead) {
		// Make sure there are no leads approving in the standard lead alerts
		const newStandardLeadAlerts = standardLeadAlerts.filter((lead) => {
			// Look through leads approving for any matching leads
			const foundLeadApproving = leadsApproving.find((approvingLead) => {
				return lead.Slack_Id === approvingLead.Slack_Id;
			});
			if (foundLeadApproving) {
				return false;
			}
			return true;
		});
		return newStandardLeadAlerts;
	}

	// If the prChanger is approving
	if (isApproving) {
		let newStandardLeadAlerts = standardLeadAlerts.filter((lead) => {
			return lead.Slack_Id !== prChanger.Slack_Id;
		});

		// The leads approving + leads req changes + fixed PR leads >= required lead approvals
		// Set the members to alert to an empty list
		if (
			leadsApproving.length + leadsReqChanges.length + fixedPRLeads.length >=
			teamOptions.Num_Required_Lead_Approvals
		) {
			newStandardLeadAlerts = [];
		}
		return newStandardLeadAlerts;
	}

	// If the prChanger is requesting changes
	let newStandardLeadAlerts = standardLeadAlerts.filter((lead) => {
		return lead.Slack_Id !== prChanger.Slack_Id;
	});

	// The leads approving + leads req changes + fixed PR leads >= required lead approvals
	// Set the leads to alert to an empty list
	if (
		leadsApproving.length + leadsReqChanges.length + fixedPRLeads.length >=
		teamOptions.Num_Required_Lead_Approvals
	) {
		newStandardLeadAlerts = [];
	}

	// If the PR owner is a lead, make sure the PR owner is added
	if (prOwnerIsLead) {
		newStandardLeadAlerts = newStandardLeadAlerts.filter((lead) => {
			return lead.Slack_Id !== prOwner.Slack_Id;
		});
		newStandardLeadAlerts.push(prOwner);
	}

	return newStandardLeadAlerts;
}
