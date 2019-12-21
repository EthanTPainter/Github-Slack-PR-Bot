import { DateTime } from "luxon";

import { SlackUser, PullRequest } from "../../../src/models";
import { newLogger } from "../../../src/logger";
import {
	getTeamOptionsAlt,
	getSlackMembersAlt,
	getSlackLeadsAlt,
} from "../../../src/json/parse";
import { constructQueueString } from "../../../src/slack/message/construct/description";
import { getTitle, getPRLink } from ".../../src/github/parse";
import {
	filterMergablePRs,
	filterLeadApprovedPRs,
	filterMemberApprovedPRs,
	filterNoFullyApprovedPRs,
} from "../filter";

const logger = newLogger("DynamoFormatter");

interface IDynamoFormatter {
	formatMyQueue(
		submittedUserId: string,
		owner: SlackUser,
		queue: PullRequest[],
		json: any,
	): string;
	formatNewPullRequest(
		slackUser: SlackUser,
		event: any,
		json: any,
	): PullRequest;
	formatTeamQueue(queue: PullRequest[], json: any): string;
}

export class DynamoFormatter implements IDynamoFormatter {
	formatMyQueue(
		submittedUserId: string,
		owner: SlackUser,
		queue: PullRequest[],
		json: any,
	): string {
		let formattedQueue = "";

		// If the queue is empty
		if (queue.length === 0) {
			formattedQueue =
				submittedUserId === owner.Slack_Id
					? "Nothing found in your queue"
					: `Nothing found in ${owner.Slack_Name}'s queue`;
			return formattedQueue;
		}
		formattedQueue = `*${owner.Slack_Name}'s Queue*\n`;

		// If the queue has contents, display them sorted:
		queue.map((pr: PullRequest) => {
			const options = getTeamOptionsAlt(pr.owner, json);
			formattedQueue += constructQueueString(pr, options);
		});
		logger.info(`Formatted Queue: ${formattedQueue}`);

		return formattedQueue;
	}

	/**
	 * @description Format inputs into expected PR Dynamo entry
	 * @param slackUser Slack User
	 * @param event Event from GitHub
	 * @param json JSON config file
	 */
	formatNewPullRequest(
		slackUser: SlackUser,
		event: any,
		json: any,
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
		// If member before lead option is true and team still needs member approvals, avoid alerting leads
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

		// Format a PR from the variables above
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

	/**
	 * @description Format a queue from a raw DynamoDB stored
	 * array into a stringified version to present on Slack
	 * @param queue DynamoDB stored queue for a user
	 * @param numReqMemberApprovals Number of required member approvals
	 * @param numReqLeadApprovals Number of required lead approvals
	 * @returns String of the DynamoDB queue contents
	 */
	formatTeamQueue(queue: PullRequest[], json: any): string {
		let formattedQueue = "";

		// If the queue is empty
		if (queue.length === 0) {
			formattedQueue = `Nothing found in the team queue`;
			return formattedQueue;
		}

		// Filter out PRs into 4 main categories
		const mergablePRs = filterMergablePRs(queue);
		const onlyHasLeadApprovals = filterLeadApprovedPRs(queue);
		const onlyHasMemberApprovals = filterMemberApprovedPRs(queue);
		const needsBothApprovals = filterNoFullyApprovedPRs(queue);

		// Format the PRs into a stringified format
		// Don't format mergable PRs. They're already mergable
		if (mergablePRs.length > 0) {
			formattedQueue += "*Mergable PRs*\n";
		}
		mergablePRs.map((mergablePR: PullRequest) => {
			const teamOptions = getTeamOptionsAlt(mergablePR.owner, json);
			formattedQueue += constructQueueString(mergablePR, teamOptions);
		});

		if (onlyHasMemberApprovals.length > 0) {
			formattedQueue += "*Needs Lead Approvals*\n";
		}
		// Sort onlyNeedsLeadApprovals by number of peers_approving
		const sortedMemberApprovals = onlyHasMemberApprovals.sort((a, b) => {
			return b.members_approving.length - a.members_approving.length;
		});
		sortedMemberApprovals.map((sortedMemberApproval: PullRequest) => {
			const teamOptions = getTeamOptionsAlt(sortedMemberApproval.owner, json);
			formattedQueue += constructQueueString(sortedMemberApproval, teamOptions);
		});

		if (onlyHasLeadApprovals.length > 0) {
			formattedQueue += "*Needs Member Approvals*\n";
		}
		// Sort onlyNeedsMemberApprovals by number of peers_approving
		const sortedLeadApprovals = onlyHasLeadApprovals.sort((a, b) => {
			return b.members_approving.length - a.members_approving.length;
		});
		sortedLeadApprovals.map((needLeadApprovalPR: PullRequest) => {
			const teamOptions = getTeamOptionsAlt(needLeadApprovalPR.owner, json);
			formattedQueue += constructQueueString(needLeadApprovalPR, teamOptions);
		});

		if (needsBothApprovals.length > 0) {
			formattedQueue += "*Needs Member and Lead Approvals*\n";
		}
		// Sort approvals by lead approvals (primary)
		// and sort this by peer approvals (secondary)
		const sortedNeedsBothApprovals = needsBothApprovals.sort((a, b) => {
			if (b.leads_approving.length === a.leads_approving.length) {
				return b.members_approving.length - a.members_approving.length;
			}
			return b.leads_approving.length - a.leads_approving.length;
		});
		sortedNeedsBothApprovals.map((needBothApprovalPR: PullRequest) => {
			const teamOptions = getTeamOptionsAlt(needBothApprovalPR.owner, json);
			formattedQueue += constructQueueString(needBothApprovalPR, teamOptions);
		});

		return formattedQueue;
	}
}
