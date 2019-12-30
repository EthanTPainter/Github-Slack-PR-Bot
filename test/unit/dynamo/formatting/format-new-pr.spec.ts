import { expect, assert } from "chai";
import { formatNewPullRequest } from "../../../../src/dynamo/formatting";
import { SlackUser, JSONConfig } from "../../../../src/models";

describe("formatNewPullRequest", () => {
	const slackUserEthan: SlackUser = {
		Slack_Name: "EthanPainter",
		Slack_Id: "<@3018485>",
	};
	const slackUserDillon: SlackUser = {
		Slack_Name: "DillonS",
		Slack_Id: "<@2222>",
	};
	const slackUserAndrew: SlackUser = {
		Slack_Name: "AndrewC",
		Slack_Id: "<@1111>",
	};

	let event: any;
	let json: JSONConfig;

	beforeEach(() => {
		event = {
			pull_request: {
				title: "NEW BRANCH NEW FEATURE",
				html_url: "www.google.com",
			},
		};
		json = {
			Departments: {
				D: {
					Ds: {
						Options: {
							Member_Before_Lead: true,
							Num_Required_Member_Approvals: 1,
							Num_Required_Lead_Approvals: 1,
							Avoid_Comment_Alerts: 4,
							Check_Mark_Text: "green",
							Disable_GitHub_Alerts: false,
							Queue_Include_Approval_Names: false,
							Queue_Include_Created_Time: false,
							Queue_Include_New_Line: false,
							Queue_Include_Owner: false,
							Queue_Include_Req_Changes_Names: false,
							Queue_Include_Updated_Time: false,
							X_Mark_Text: "red",
							Require_Fresh_Approvals: false,
							Fresh_Approval_Repositories: [],
						},
						Users: {
							Leads: {
								Ethan: {
									Slack_Name: "EthanPainter",
									Slack_Id: "<@3018485>",
								},
								Andrew: {
									Slack_Name: "AndrewC",
									Slack_Id: "<@1111>",
								},
							},
							Members: {
								Dillon: {
									Slack_Name: "DillonS",
									Slack_Id: "<@2222>",
								},
							},
						},
					},
				},
			},
		};
	});

	it("should format a PR (lead PR, 2 leads, 1 member, 1 lead req, 1 member req)", () => {
		const result = formatNewPullRequest(slackUserEthan, event, json);
		const expected = {
			owner: slackUserEthan,
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			standard_leads_alert: [],
			standard_members_alert: [slackUserDillon],
			member_complete: false,
			members_approving: [],
			lead_complete: false,
			leads_approving: [],
			events: [
				{
					user: slackUserEthan,
					action: "OPENED",
					time: "RANDOM TIMESTAMP",
				},
			],
		};

		expect(result.standard_leads_alert).deep.equal(
			expected.standard_leads_alert,
		);
		expect(result.leads_approving).deep.equal(expected.leads_approving);
		expect(result.standard_members_alert).deep.equal(
			expected.standard_members_alert,
		);
		expect(result.members_approving).deep.equal(expected.members_approving);
		expect(result.events[0].user).deep.equal(expected.events[0].user);
		expect(result.events[0].action).equal("OPENED");
	});

	it("should format an PullRequest (member PR, 2 leads, 1 member, 1 lead req, 1 member req) ", () => {
		const result = formatNewPullRequest(slackUserDillon, event, json);
		const expected = {
			owner: slackUserDillon,
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			standard_leads_alert: [],
			standard_members_alert: [],
			member_complete: false,
			members_approving: [],
			lead_complete: false,
			leads_approving: [],
			events: [
				{
					user: slackUserDillon,
					action: "OPENED",
					time: "RANDOM TIMESTAMP",
				},
			],
		};

		expect(result.standard_leads_alert).deep.equal(
			expected.standard_leads_alert,
		);
		expect(result.leads_approving).deep.equal(expected.leads_approving);
		expect(result.standard_members_alert).deep.equal(
			expected.standard_members_alert,
		);
		expect(result.members_approving).deep.equal(expected.members_approving);
		expect(result.events[0].user).deep.equal(expected.events[0].user);
		expect(result.events[0].action).equal("OPENED");
	});

	it("should format an PullRequest (lead PR, 2 leads, 1 member, 1 lead req, 0 member req) ", () => {
		json.Departments.D.Ds.Options.Num_Required_Member_Approvals = 0;

		const result = formatNewPullRequest(slackUserEthan, event, json);
		const expected = {
			owner: slackUserEthan,
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			standard_leads_alert: [slackUserAndrew],
			standard_members_alert: [],
			member_complete: true,
			members_approving: [],
			lead_complete: false,
			leads_approving: [],
			events: [
				{
					user: slackUserEthan,
					action: "OPENED",
					time: "RANDOM TIMESTAMP",
				},
			],
		};

		expect(result.standard_leads_alert).deep.equal(
			expected.standard_leads_alert,
		);
		expect(result.leads_approving).deep.equal(expected.leads_approving);
		expect(result.standard_members_alert).deep.equal(
			expected.standard_members_alert,
		);
		expect(result.members_approving).deep.equal(expected.members_approving);
		expect(result.events[0].user).deep.equal(expected.events[0].user);
		expect(result.events[0].action).equal("OPENED");
	});

	it("should format an PullRequest (lead PR, 2 leads, 1 member, 0 lead req, 1 member req) ", () => {
		json.Departments.D.Ds.Options.Num_Required_Lead_Approvals = 0;

		const result = formatNewPullRequest(slackUserEthan, event, json);
		const expected = {
			owner: slackUserEthan,
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			standard_leads_alert: [],
			standard_members_alert: [slackUserDillon],
			member_complete: false,
			members_approving: [],
			lead_complete: true,
			leads_approving: [],
			events: [
				{
					user: slackUserEthan,
					action: "OPENED",
					time: "RANDOM TIMESTAMP",
				},
			],
		};

		expect(result.standard_leads_alert).deep.equal(
			expected.standard_leads_alert,
		);
		expect(result.leads_approving).deep.equal(expected.leads_approving);
		expect(result.standard_members_alert).deep.equal(
			expected.standard_members_alert,
		);
		expect(result.members_approving).deep.equal(expected.members_approving);
		expect(result.events[0].user).deep.equal(expected.events[0].user);
		expect(result.events[0].action).equal("OPENED");
	});
});
