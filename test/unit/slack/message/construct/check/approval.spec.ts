import { expect } from "chai";
import { getApprovalChecks } from "../../../../../../src/slack/message/construct/checks/approval";

describe("getApprovalChecks", () => {
	const validJSON = {
		Departments: {
			Devs: {
				DevTeam1: {
					Options: {
						X_Mark_Text: ":X:",
						Check_Mark_Text: ":heavy_check_mark:",
						Num_Required_Member_Approvals: 1,
						Num_Required_Lead_Approvals: 1,
						Avoid_Comment_Alerts: 5,
						Queue_Include_Created_Time: true,
						Queue_Include_Updated_Time: true,
						Queue_Include_Approval_Names: true,
						Queue_Include_Req_Changes_Names: true,
						Queue_Include_Owner: true,
						Queue_Include_New_Line: false,
						Member_Before_Lead: true,
						Disable_GitHub_Alerts: false,
						Require_Fresh_Approvals: false,
						Fresh_Approval_Repositories: [],
					},
					Slack_Group: {
						Slack_Name: "Group_Slack_Name",
						Slack_Id: "<@SLACK_ID>",
					},
					Users: {
						Leads: {
							GitHub_User_1: {
								Slack_Name: "Slack_user_1",
								Slack_Id: "<@SLACK_ID_1>",
							},
						},
						Members: {
							GitHub_User_2: {
								Slack_Name: "Slack_user_2",
								Slack_Id: "<@SLACK_ID_2>",
							},
							GitHub_User_3: {
								Slack_Name: "Slack_user_3",
								Slack_Id: "<@SLACK_ID_3>",
							},
							GitHub_User_4: {
								Slack_Name: "Slack_user_4",
								Slack_Id: "<@SLACK_ID_4>",
							},
						},
					},
				},
			},
		},
	};

	it("Should get approval status when no existing approving users", () => {
		const slackOwner =
			validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
		const allReviews = {
			GitHub_User_1: "COMMENTED",
		};
		const slackMemberUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Members,
		);
		const slackLeadUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Leads,
		);

		const result = getApprovalChecks(
			validJSON,
			slackOwner,
			allReviews,
			slackMemberUsers,
			slackLeadUsers,
		);

		// Member Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_3
					.Slack_Id,
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_4
					.Slack_Id,
			),
		).equal(true);
		// LEAD Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1.Slack_Id,
			),
		).equal(true);
	});

	it("Should get approval status with one approving Member user", () => {
		const slackOwner =
			validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
		const allReviews = {
			GitHub_User_3: "APPROVED",
		};
		const slackMemberUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Members,
		);
		const slackLeadUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Leads,
		);

		const result = getApprovalChecks(
			validJSON,
			slackOwner,
			allReviews,
			slackMemberUsers,
			slackLeadUsers,
		);

		// Member Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_3
					.Slack_Name,
			),
		).equal(true);
		// LEAD Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1.Slack_Id,
			),
		).equal(true);
	});

	it("Should get approval status with one approving Member and one approving lead", () => {
		const slackOwner =
			validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
		const allReviews = {
			GitHub_User_1: "APPROVED",
			GitHub_User_4: "APPROVED",
		};
		const slackMemberUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Members,
		);
		const slackLeadUsers = Object.values(
			validJSON.Departments.Devs.DevTeam1.Users.Leads,
		);

		const result = getApprovalChecks(
			validJSON,
			slackOwner,
			allReviews,
			slackMemberUsers,
			slackLeadUsers,
		);

		// Member Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_4
					.Slack_Name,
			),
		).equal(true);
		// LEAD Check
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals.toString(),
			),
		).equal(true);
		expect(
			result.includes(
				validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1
					.Slack_Name,
			),
		).equal(true);
	});
});
