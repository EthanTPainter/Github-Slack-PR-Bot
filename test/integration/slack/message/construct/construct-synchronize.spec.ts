import { assert } from "chai";
import { json } from "../../../json";
import { constructSynchronize } from "../../../../../src/slack/message/construct";
import { PullRequest } from "../../../../../src/models";
import { DynamoGet, DynamoUpdate } from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";

describe("constructSynchronize", () => {
	it("should construct synchronize with both members and leads approving", async () => {
		json.Departments.Devs.DevTeam1.Options.Require_Fresh_Approvals = true;
		json.Departments.Devs.DevTeam1.Options.Fresh_Approval_Repositories = [
			"repoName",
		] as any;

		const event = {
			repository: {
				name: "repoName",
			},
			pull_request: {
				title: "PR TITLE",
				user: {
					login: "GitHubMember1",
				},
				html_url: "www.github.com/PR",
			},
		};

		// Update GitHub
		const pr: PullRequest = {
			comment_times: {},
			owner: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			standard_leads_alert: [],
			standard_members_alert: [],
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			lead_complete: true,
			leads_approving: [json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			member_complete: true,
			members_approving: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			],
			members_req_changes: [],
			req_changes_members_alert: [],
			events: [
				{
					action: "OPENED",
					time: "OLD",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				},
				{
					action: "APPROVED",
					time: "THEN",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				},
				{
					action: "APPROVED",
					time: "NOW-ISH",
					user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				},
			],
		};

		// Prepare Dynamo Table
		const dynamoUpdate = new DynamoUpdate();

		dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json.Departments.Devs.DevTeam1.Slack_Group,
			[],
			pr,
		);

		const result = await constructSynchronize(
			event,
			json,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
		);

		assert.deepEqual(result.alert, true);
		assert.deepEqual(result.url, event.pull_request.html_url);
		assert.deepEqual(result.title, event.pull_request.title);
		assert.deepEqual(
			result.reset_approving_users,
			pr.leads_approving.concat(pr.members_approving),
		);
	});
	it("should construct synchronize with members approving", async () => {
		json.Departments.Devs.DevTeam1.Options.Require_Fresh_Approvals = true;
		json.Departments.Devs.DevTeam1.Options.Fresh_Approval_Repositories = [
			"repoName",
		] as any;

		const event = {
			repository: {
				name: "repoName",
			},
			pull_request: {
				title: "PR TITLE",
				user: {
					login: "GitHubMember1",
				},
				html_url: "www.github.com/PR",
			},
		};

		// Update GitHub
		const pr: PullRequest = {
			comment_times: {},
			owner: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			standard_leads_alert: [],
			standard_members_alert: [],
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			lead_complete: false,
			leads_approving: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			member_complete: true,
			members_approving: [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			],
			members_req_changes: [],
			req_changes_members_alert: [],
			events: [
				{
					action: "OPENED",
					time: "OLD",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				},
				{
					action: "APPROVED",
					time: "THEN",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				},
			],
		};

		// Prepare Dynamo Table
		const dynamoUpdate = new DynamoUpdate();

		dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json.Departments.Devs.DevTeam1.Slack_Group,
			[],
			pr,
		);

		const result = await constructSynchronize(
			event,
			json,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
		);

		assert.deepEqual(result.alert, true);
		assert.deepEqual(result.url, event.pull_request.html_url);
		assert.deepEqual(result.title, event.pull_request.title);
		assert.deepEqual(result.reset_approving_users, pr.members_approving);
	});
	it("should construct synchronize with only leads approving", async () => {
		json.Departments.Devs.DevTeam1.Options.Require_Fresh_Approvals = true;
		json.Departments.Devs.DevTeam1.Options.Fresh_Approval_Repositories = [
			"repoName",
		] as any;

		const event = {
			repository: {
				name: "repoName",
			},
			pull_request: {
				title: "PR TITLE",
				user: {
					login: "GitHubMember1",
				},
				html_url: "www.github.com/PR",
			},
		};

		// Update GitHub
		const pr: PullRequest = {
			comment_times: {},
			owner: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			standard_leads_alert: [],
			standard_members_alert: [],
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			lead_complete: true,
			leads_approving: [json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			member_complete: false,
			members_approving: [],
			members_req_changes: [],
			req_changes_members_alert: [],
			events: [
				{
					action: "OPENED",
					time: "OLD",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				},
				{
					action: "APPROVED",
					time: "NOW-ISH",
					user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				},
			],
		};

		// Prepare Dynamo Table
		const dynamoUpdate = new DynamoUpdate();

		dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json.Departments.Devs.DevTeam1.Slack_Group,
			[],
			pr,
		);

		const result = await constructSynchronize(
			event,
			json,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
		);

		assert.deepEqual(result.alert, true);
		assert.deepEqual(result.url, event.pull_request.html_url);
		assert.deepEqual(result.title, event.pull_request.title);
		assert.deepEqual(result.reset_approving_users, pr.leads_approving);
	});
	it("should construct synchronize without members or leads approving", async () => {
		json.Departments.Devs.DevTeam1.Options.Require_Fresh_Approvals = true;
		json.Departments.Devs.DevTeam1.Options.Fresh_Approval_Repositories = [
			"repoName",
		] as any;

		const event = {
			repository: {
				name: "repoName",
			},
			pull_request: {
				title: "PR TITLE",
				user: {
					login: "GitHubMember1",
				},
				html_url: "www.github.com/PR",
			},
		};

		// Update GitHub
		const pr: PullRequest = {
			comment_times: {},
			owner: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			standard_leads_alert: [],
			standard_members_alert: [],
			title: event.pull_request.title,
			url: event.pull_request.html_url,
			lead_complete: false,
			leads_approving: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			member_complete: false,
			members_approving: [],
			members_req_changes: [],
			req_changes_members_alert: [],
			events: [
				{
					action: "OPENED",
					time: "OLD",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				},
				{
					action: "APPROVED",
					time: "THEN",
					user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				},
				{
					action: "APPROVED",
					time: "NOW-ISH",
					user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				},
			],
		};

		// Prepare Dynamo Table
		const dynamoUpdate = new DynamoUpdate();

		dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			json.Departments.Devs.DevTeam1.Slack_Group,
			[],
			pr,
		);

		const result = await constructSynchronize(
			event,
			json,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
		);

		assert.deepEqual(result.alert, false);
		assert.deepEqual(result.url, event.pull_request.html_url);
		assert.deepEqual(result.title, event.pull_request.title);
		assert.deepEqual(result.reset_approving_users, []);
  });
});
