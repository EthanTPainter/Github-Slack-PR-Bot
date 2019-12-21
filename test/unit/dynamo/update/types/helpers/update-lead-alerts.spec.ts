import { expect } from "chai";
import { updateLeadAlerts } from "../../../../../../src/dynamo/update/types/helpers/update-lead-alerts";
import { requiredEnvs } from "../../../../../../src/required-envs";

describe("updateLeadAlerts", () => {
	let json: any;

	beforeEach(() => {
		json = {
			Departments: {
				Devs: {
					DevTeam1: {
						Options: {
							Avoid_Comment_Alerts: 5,
							Check_Mark_Text: ":heavy_check_mark:",
							X_Mark_Text: ":X:",
							Include_Created_Time: true,
							Include_Updated_Time: true,
							Num_Required_Lead_Approvals: 1,
							Num_Required_Member_Approvals: 1,
							Member_Before_Lead: true,
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
								GitHubLead4: {
									Slack_Name: "SlackLeadName4",
									Slack_Id: "<SlackLeadId4>",
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
	});

	it("should update leads given one approving lead (1 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			leads_req_changes: [],
			members_req_changes: [],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 1,
		};
		const isApproving = true;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([slackUserChanging]);
		expect(result.pr.standard_leads_alert).deep.equal([]);
		expect(result.pr.leads_req_changes).deep.equal([]);
		expect(result.pr.lead_complete).equal(true);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});

	it("should update leads given one approving lead (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging = pr.standard_leads_alert[0];
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([slackUserChanging]);
		expect(result.pr.standard_leads_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
		expect(result.pr.leads_req_changes).deep.equal([]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([]);
	});

	it("should update leads given one lead requesting changes (1 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 1,
		};
		const isApproving = false;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([]);
		expect(result.pr.standard_leads_alert).deep.equal([slackUserOwner]);
		expect(result.pr.leads_req_changes).deep.equal([slackUserChanging]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});

	it("should update leads given one lead requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([]);
		expect(result.pr.standard_leads_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
		]);
		expect(result.pr.leads_req_changes).deep.equal([slackUserChanging]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([]);
	});

	it("should update leads given two approving leads (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [],
			leads_approving: [json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
		]);
		expect(result.pr.standard_leads_alert).deep.equal([]);
		expect(result.pr.leads_req_changes).deep.equal([]);
		expect(result.pr.lead_complete).equal(true);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});

	it("should update leads given two leads requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
			],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([]);
		expect(result.pr.standard_leads_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
		]);
		expect(result.pr.leads_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
		]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});

	it("should update leads given one approving, one requesting changes (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [],
			leads_approving: [json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = false;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
		]);
		expect(result.pr.standard_leads_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
		]);
		expect(result.pr.leads_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
		]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});

	it("should update leads given one requesting changes, one approving (2 Req)", async () => {
		const pr: any = {
			req_changes_members_alert: [],
			req_changes_leads_alert: [],
			members_req_changes: [],
			leads_req_changes: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
			],
			leads_approving: [],
			standard_leads_alert: [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			],
			standard_members_alert: [],
			lead_complete: false,
		};
		const slackUserOwner =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
		const slackUserChanging =
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
		const teamOptions: any = {
			Num_Required_Lead_Approvals: 2,
		};
		const isApproving = true;

		const result = await updateLeadAlerts(
			pr,
			slackUserOwner,
			slackUserChanging,
			teamOptions,
			isApproving,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json,
		);

		expect(result.pr.leads_approving).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
		]);
		expect(result.pr.standard_leads_alert).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
		]);
		expect(result.pr.leads_req_changes).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
		]);
		expect(result.pr.lead_complete).equal(false);

		expect(result.leftLeads).deep.equal([
			json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
		]);
	});
});
