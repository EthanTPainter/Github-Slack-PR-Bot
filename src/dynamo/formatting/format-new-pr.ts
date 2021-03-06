import { DateTime } from "luxon";
import { getTitle, getPRLink } from "../../github/parse";
import { SlackUser, PullRequest, JSONConfig } from "../../models";

import {
	getTeamOptionsAlt,
	getSlackMembersAlt,
	getSlackLeadsAlt,
} from "../../json/parse";

/**
 * @description Given inputs, format an
 *              Item able to insert into
 *              a DynamoDB table.
 * @param slackUser Slack User
 * @param event Event from GitHub
 * @param json JSON config file
 */
export function formatNewPullRequest(
	slackUser: SlackUser,
	event: any,
	json: JSONConfig,
): PullRequest {
	// Get title & url from event
	const title = getTitle(event);
	const htmlUrl = getPRLink(event);

	// Get Required Approvals Numbers
	const teamOptions = getTeamOptionsAlt(slackUser, json);
	const numReqMember = teamOptions.Num_Required_Member_Approvals;
	const numReqLead = teamOptions.Num_Required_Lead_Approvals;

	// Setup for setting member and lead alerts
	let members: SlackUser[];
	let leads: SlackUser[];
	let memberComplete = false;
	let leadComplete = false;

	// If required member approvals is 0, avoid alerting members
	// Otherwise make a list of all possible members  (exclude owner if also a member)
	if (numReqMember === 0) {
		memberComplete = true;
		members = [];
	} else {
		const allTeamMembers = getSlackMembersAlt(slackUser, json);
		members = allTeamMembers.filter(
			(member: SlackUser) => member.Slack_Id !== slackUser.Slack_Id,
		);
	}

	// If required lead approvals is 0, avoid alerting leads
	// If member before lead option is true && still need member approvals, leadIds is []
	// Otherwise make a list of all possible leads (exclude owner if also a lead)
	if (numReqLead === 0) {
		leadComplete = true;
		leads = [];
	} else if (
		teamOptions.Member_Before_Lead === true &&
		memberComplete === false
	) {
		leadComplete = false;
		leads = [];
	} else {
		const allTeamLeads = getSlackLeadsAlt(slackUser, json);
		leads = allTeamLeads.filter(
			(lead: SlackUser) => lead.Slack_Id !== slackUser.Slack_Id,
		);
	}

	// Make timestamp for last updated time
	const currentTime = DateTime.local().toLocaleString(
		DateTime.DATETIME_FULL_WITH_SECONDS,
	);

	// Format an pr from the variables above
	const pr: PullRequest = {
		owner: slackUser,
		title: title,
		url: htmlUrl,
		comment_times: {},
		standard_members_alert: members,
		standard_leads_alert: leads,
		member_complete: memberComplete,
		members_approving: [],
		members_req_changes: [],
		lead_complete: leadComplete,
		leads_approving: [],
		leads_req_changes: [],
		req_changes_leads_alert: [],
		req_changes_members_alert: [],
		events: [
			{
				user: slackUser,
				action: "OPENED",
				time: currentTime,
			},
		],
	};

	return pr;
}
