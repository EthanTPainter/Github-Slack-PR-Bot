import { SlackUser, JSONConfig } from "../../../../models";
import { getSlackLeadsAlt, getSlackMembersAlt } from "../../../../json/parse";

/**
 * @description Tell whether a user is a lead or not
 * @param slackUser Slack User
 * @param json JSON Config
 */
export function checkIfUserIsLead(
	slackUser: SlackUser,
	json: JSONConfig,
): boolean {
	const teamLeads = getSlackLeadsAlt(slackUser, json);
	const foundLead = teamLeads.find((lead) => {
		return lead.Slack_Id === slackUser.Slack_Id;
	});
	return foundLead ? true : false;
}

/**
 * @description Tell whether a user is a member or not
 * @param slackUser Slack User
 * @param json JSON Config
 */
export function checkIfUserIsMember(
	slackUser: SlackUser,
	json: JSONConfig,
): boolean {
	const teamMembers = getSlackMembersAlt(slackUser, json);
	const foundMember = teamMembers.find((member) => {
		return member.Slack_Id == slackUser.Slack_Id;
	});
	return foundMember ? true : false;
}
