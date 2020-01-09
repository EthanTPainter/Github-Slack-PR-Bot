import { SlackUser } from "../../../../models";

/**
 * @description Get the leftover members between the initial and updated PR
 * @param initialPR Initial PR
 * @param newStandardMemberAlerts Updated standard member alerts
 * @param prChanger (Optional) Slack User changing the leftover members
 */
export function getLeftoverMembers(
	oldStandardMemberAlerts: SlackUser[],
	newStandardMemberAlerts: SlackUser[],
	prChanger?: SlackUser,
): SlackUser[] {
	// Construct a list of all possible leads (Avoid duplicates)
	let tempMemberAlerts = oldStandardMemberAlerts.concat(
		newStandardMemberAlerts,
	);
	const allLeadAlerts: SlackUser[] = [];

	tempMemberAlerts.filter((tempMember) => {
		const alreadyAppended = allLeadAlerts.find((lead) => {
			return lead.Slack_Id === tempMember.Slack_Id;
		});

		alreadyAppended ? undefined : allLeadAlerts.push(tempMember);
	});

	// For each lead that is alerted
	// Check if the lead exists in old and new lists. If so, ignore
	// If it exists only in the old and not in the new, append
	let leftoverMembers = allLeadAlerts.filter((member) => {
		const foundOldMember = oldStandardMemberAlerts.find((oldMember) => {
			return oldMember.Slack_Id === member.Slack_Id;
		});
		const foundNewMember = newStandardMemberAlerts.find((newMember) => {
			return newMember.Slack_Id === member.Slack_Id;
		});

		if (foundOldMember && !foundNewMember) {
			return true;
		}
		return false;
	});

	// Make sure to remove the PR changer if they exist
	if (prChanger) {
		leftoverMembers = leftoverMembers.filter((member) => {
			if (member.Slack_Id !== prChanger.Slack_Id) {
				return true;
			}
			return false;
		});
	}

	return leftoverMembers;
}
