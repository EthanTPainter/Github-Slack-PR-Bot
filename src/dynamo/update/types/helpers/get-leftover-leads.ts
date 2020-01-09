import { SlackUser, PullRequest } from "../../../../models";

/**
 * @description Get the leftover leads between the inital and updated PR
 * @param initialPR Initial PR
 * @param newStandardLeadAlerts Updated standard lead alerts
 * @param prChanger (Optional) Slack User making changes
 */
export function getLeftoverLeads(
	oldStandardLeadAlerts: SlackUser[],
	newStandardLeadAlerts: SlackUser[],
	prChanger?: SlackUser,
): SlackUser[] {
	// Construct a list of all possible leads (Avoid duplicates)
	let tempLeadAlerts = oldStandardLeadAlerts.concat(newStandardLeadAlerts);
	const allLeadAlerts: SlackUser[] = [];

	tempLeadAlerts.filter((tempLead) => {
		const alreadyAppended = allLeadAlerts.find((lead) => {
			return lead.Slack_Id === tempLead.Slack_Id;
		});

		alreadyAppended ? undefined : allLeadAlerts.push(tempLead);
	});

	// For each lead that is alerted
	// Check if the lead exists in old and new lists. If so, ignore
	// If it exists only in the old and not in the new, append
	let leftoverLeads = allLeadAlerts.filter((lead) => {
		const foundOldLead = oldStandardLeadAlerts.find((oldLead) => {
			return oldLead.Slack_Id === lead.Slack_Id;
		});
		const foundNewLead = newStandardLeadAlerts.find((newLead) => {
			return newLead.Slack_Id === lead.Slack_Id;
		});

		if (foundOldLead && !foundNewLead) {
			return true;
		}
		return false;
	});

	if (prChanger) {
		leftoverLeads = leftoverLeads.filter((lead) => {
			if (lead.Slack_Id !== prChanger.Slack_Id) {
				return true;
			}
			return false;
		});
	}

	return leftoverLeads;
}
