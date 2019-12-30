import * as sinon from "sinon";
import { expect } from "chai";
import { JSONConfig } from "../../../../../../src/models";

import { requiredEnvs } from "../../../../../../src/required-envs";
import { DynamoGet, DynamoRemove } from "../../../../../../src/dynamo/api";
import { updateMemberAlerts } from "../../../../../../src/dynamo/update/types/helpers/update-member-alerts";

describe("updateMemberAlerts", () => {
	let json: JSONConfig;

	// Remove any interaction with temp databases in unit tests
	const dynamoGet = new DynamoGet();
	const dynamoRemove = new DynamoRemove();
	let sandbox: sinon.SinonSandbox;

	beforeEach(() => {
		json = {
			Departments: {
				Devs: {
					DevTeam1: {
						Options: {
							Avoid_Comment_Alerts: 5,
							Check_Mark_Text: ":heavy_check_mark:",
							X_Mark_Text: ":X:",
							Queue_Include_Created_Time: true,
							Queue_Include_Updated_Time: true,
							Queue_Include_Approval_Names: true,
							Queue_Include_Req_Changes_Names: false,
							Queue_Include_Owner: false,
							Queue_Include_New_Line: false,
							Disable_GitHub_Alerts: false,
							Num_Required_Lead_Approvals: 1,
							Num_Required_Member_Approvals: 1,
							Member_Before_Lead: true,
							Require_Fresh_Approvals: false,
							Fresh_Approval_Repositories: [],
						},
						Slack_Group: {
							Slack_Name: "SlackGroupName",
							Slack_Id: "<SlackGroupId>",
						},
						Users: {
							Leads: {
								GitHubLead1: {
									Slack_Name: "SlackLeadName1",
									Slack_Id: "<SlackLeadId1>",
								},
								GitHubLead2: {
									Slack_Name: "SlackLeadName2",
									Slack_Id: "<SlackLeadId2>",
								},
								GitHubLead3: {
									Slack_Name: "SlackLeadName3",
									Slack_Id: "<SlackLeadId3>",
								},
							},
							Members: {
								GitHubMember1: {
									Slack_Name: "SlackMemberName1",
									Slack_Id: "<SlackMemberId1>",
								},
								GitHubMember2: {
									Slack_Name: "SlackMemberName2",
									Slack_Id: "<SlackMemberId2>",
								},
								GitHubMember3: {
									Slack_Name: "SlackMemberName3",
									Slack_Id: "<SlackMemberId3>",
								},
								GitHubMember4: {
									Slack_Name: "SlackMemberName4",
									Slack_Id: "<SlackMemberId4>",
								},
							},
						},
					},
				},
			},
		};
		sandbox = sinon.createSandbox();
		sandbox.stub(dynamoGet, "getQueue").resolves();
		sandbox.stub(dynamoRemove, "removePullRequest").resolves();
	});

	afterEach(() => {
		sandbox.restore();
	});

	it("should update members given one approving member (1 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 1,
		};
		const isApproving = true;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(true);
		expect(result.pr.members_approving).deep.equal([slackUserChanging]);
		expect(result.pr.standard_members_alert).deep.equal([]);
		expect(result.pr.members_req_changes).deep.equal([]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});

	it("should update members given one approving member (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);
		expect(result.pr.standard_members_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
		expect(result.pr.members_req_changes).deep.equal([]);

		expect(result.leftMembers).deep.equal([]);
	});

	it("should update members given one member requesting changes (1 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 1,
		};
		const isApproving = false;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([]);
		expect(result.pr.standard_members_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
		]);
		expect(result.pr.members_req_changes).deep.equal([slackUserChanging]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});

	it("should update members given one member requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([]);
		expect(result.pr.standard_members_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
		]);
		expect(result.pr.members_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);

		expect(result.leftMembers).deep.equal([]);
	});

	it("should update members given two approving members (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(true);
		expect(result.pr.members_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);
		expect(result.pr.standard_members_alert).deep.equal([]);
		expect(result.pr.members_req_changes).deep.equal([]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});

	it("should update members given two members requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([]);
		expect(result.pr.standard_members_alert).deep.equal([slackUserOwner]);
		expect(result.pr.members_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});

	it("should update members given one approving, one requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [],
			members_approving: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
		]);
		expect(result.pr.standard_members_alert).deep.equal([slackUserOwner]);
		expect(result.pr.members_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});

	it("should update memebers given one requesting changes, one approving (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			standard_leads_alert: [],
			members_req_changes: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
			],
			members_approving: [],
			standard_members_alert: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			],
			member_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
		const teamOptions: any = {
			Num_Required_Member_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateMemberAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.member_complete).equal(false);
		expect(result.pr.members_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		]);
		expect(result.pr.standard_members_alert).deep.equal([slackUserOwner]);
		expect(result.pr.members_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
		]);

		expect(result.leftMembers).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
		]);
	});
});
