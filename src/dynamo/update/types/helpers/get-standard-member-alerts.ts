import { SlackUser, TeamOptions } from "../../../../models";

/**
 * @description Get standard member alerts
 * @param prOwner Slack User who owns the PR
 * @param prOwnerIsLead If the PR Owner is a lead
 * @param prChanger Slack User who is changing the PR
 * @param prChangerIsLead If the PR changer is a lead
 * @param isApproving If the PR changer is approving or requesting changes
 * @param standardMemberAlerts Current standard member alerts
 * @param membersReqChanges Members requesting changes
 * @param fixedPRmembers Members who have been alerted about a fixed PR
 * @param teamOptions Team Options
 */
export function getStandardMemberAlerts(
	prOwner: SlackUser,
	prOwnerIsLead: boolean,
	prChanger: SlackUser,
	prChangerIsLead: boolean,
	isApproving: boolean,
	standardMemberAlerts: SlackUser[],
	membersApproving: SlackUser[],
	membersReqChanges: SlackUser[],
	fixedPRmembers: SlackUser[],
	teamOptions: TeamOptions,
): SlackUser[] {
  // If there are no member approvals required, don't alert
  if (teamOptions.Num_Required_Member_Approvals === 0) {
    return [];
  }

	// If the PR Changer is a lead
	if (prChangerIsLead) {
		// If the PR Owner is a member and the user is not approving, make sure the member is alerted
		if (!prOwnerIsLead && !isApproving) {
			const newStandardMemberAlerts = standardMemberAlerts.filter((member) => {
				return member.Slack_Id !== prOwner.Slack_Id;
			});
			newStandardMemberAlerts.push(prOwner);
			return newStandardMemberAlerts;
		}
		// If the PR Owner is a lead, keep the standard member alerts as is
		return standardMemberAlerts;
	}

	// If the user changing is approving
	if (isApproving) {
		// First remove the PR Approver from the standard member alerts
		let newStandardMemberAlerts = standardMemberAlerts.filter((member) => {
			return member.Slack_Id !== prChanger.Slack_Id;
		});

		// The members approving + members req changes + fixed PR members >= required member approvals
		// Set the members to alert to an empty list
		if (
			membersApproving.length +
				membersReqChanges.length +
				fixedPRmembers.length >=
			teamOptions.Num_Required_Member_Approvals
		) {
			newStandardMemberAlerts = [];
		}

		// If there are any members requesting changes AND the PR owner is a member
		// Add the member to the standard member alerts
		if (membersReqChanges.length > 0 && !prOwnerIsLead) {
			newStandardMemberAlerts.push(prOwner);
		}

		return newStandardMemberAlerts;
	}

	// Otherwise assume the user is requesting changes
	// First remove the PR changer from standard member alerts
	let newStandardMemberAlerts = standardMemberAlerts.filter((member) => {
		return member.Slack_Id !== prChanger.Slack_Id;
  });
  
  // The members approving + members req changes + fixed PR members >= required member approvals
	// Set the members to alert to an empty list
	if (
		membersApproving.length +
			membersReqChanges.length +
			fixedPRmembers.length >=
		teamOptions.Num_Required_Member_Approvals
	) {
		newStandardMemberAlerts = [];
	}

	// If the PR owner is a member, make sure the PR owner is added
	if (!prOwnerIsLead) {
		newStandardMemberAlerts = newStandardMemberAlerts.filter((member) => {
			return member.Slack_Id !== prOwner.Slack_Id;
		});
		newStandardMemberAlerts.push(prOwner);
	}

	return newStandardMemberAlerts;
}
