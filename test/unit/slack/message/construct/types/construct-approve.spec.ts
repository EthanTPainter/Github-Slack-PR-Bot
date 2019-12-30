import { expect } from "chai";
import * as sinon from "sinon";
import { constructApprove } from "../../../../../../src/slack/message/construct";
import { Review } from "../../../../../../src/github/api";

describe("constructApprove", () => {
	const validEvent = {
		action: "submitted",
		pull_request: {
			title: "feat(123): Adding a new feature",
			url:
				"https://api.github.com/repos/EthanTPainter/Comparative-Programming/pulls/1",
			html_url:
				"https://github.com/EthanTPainter/Comparative-Programming/pull/1",
			user: {
				login: "EthanTPainter",
			},
		},
		sender: {
			login: "gwely",
		},
		repository: {
			private: false,
		},
	};

	const validJSON = {
		Departments: {
			Dev: {
				Team1: {
					Options: {
            Avoid_Comment_Alerts: 10,
            Check_Mark_Text: ":heavy_check_mark:",
            X_Mark_Text: ":X:",
            Queue_Include_Created_Time: false,
            Queue_Include_Updated_Time: false,
            Queue_Include_Approval_Names: false,
            Queue_Include_Req_Changes_Names: false,
            Queue_Include_Owner: false,
            Queue_Include_New_Line: false,
            Num_Required_Member_Approvals: 2,
            Num_Required_Lead_Approvals: 2,
            Disable_GitHub_Alerts: false,
						Member_Before_Lead: false,
						Require_Fresh_Approvals: false,
						Fresh_Approval_Repositories: [],
          },
					Users: {
						Leads: {
							gwely: {
								Slack_Name: "andrew.curcie",
								Slack_Id: "<@1111>",
							},
						},
						Members: {
							EthanTPainter: {
								Slack_Name: "ethan.painter",
								Slack_Id: "<@2222>",
							},
							DillonSykes: {
								Slack_Name: "dillon.sykes",
								Slack_Id: "<@3333>",
							},
						},
					},
				},
			},
		},
  };
  const gitHubToken = "abc123";

	it("should construct an ApprovePR object", async () => {
    const ReviewClass = new Review();
		const expectedReviews = [
			{
				user: {
					login: "EthanTPainter",
				},
				state: "COMMENTED",
			},
			{
				user: {
					login: "gwely",
				},
				state: "APPROVED",
			},
			{
				user: {
					login: "DillonSykes",
				},
				state: "CHANGES_REQUESTED",
			},
			{
				user: {
					login: "DillonSykes",
				},
				state: "APPROVED",
			},
		];

		// Stub getReviews
		sinon.stub(ReviewClass, "getReviews").resolves(expectedReviews);

		const result = await constructApprove(ReviewClass, validEvent, validJSON, gitHubToken);

		// Expect SlackUser slack names to be in ApprovePR description
		expect(
			result.description.includes(
				validJSON.Departments.Dev.Team1.Users.Leads.gwely.Slack_Name,
			),
		).equal(true);
		expect(
			result.description.includes(
				validJSON.Departments.Dev.Team1.Users.Members.EthanTPainter.Slack_Id,
			),
		).equal(true);

		// Expect title, url, owner, and sender in ApprovePR
		expect(result.title).equal(validEvent.pull_request.title);
		expect(result.url).equal(validEvent.pull_request.html_url);
		expect(result.owner).equal(validEvent.pull_request.user.login);
		expect(result.user_approving).equal(validEvent.sender.login);

		// Expect approvals to be properly formatted
		expect(
			result.approvals.includes(
				validJSON.Departments.Dev.Team1.Options.Num_Required_Member_Approvals +
					" Required Member",
			),
		).equal(true);
		expect(
			result.approvals.includes(
				validJSON.Departments.Dev.Team1.Users.Members.DillonSykes.Slack_Name +
					" :heavy_check_mark:",
			),
		).equal(true);
		expect(
			result.approvals.includes(
				validJSON.Departments.Dev.Team1.Options.Num_Required_Lead_Approvals +
					" Required Lead",
			),
		).equal(true);
		expect(
			result.approvals.includes(
				validJSON.Departments.Dev.Team1.Users.Leads.gwely.Slack_Name +
					" :heavy_check_mark:",
			),
		).equal(true);
	});
});
