import { expect } from "chai";
import { json } from "../../../json";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateReqChanges } from "../../../../../src/dynamo/update";
import {
	DynamoGet,
	DynamoReset,
	DynamoAppend,
} from "../../../../../src/dynamo/api";

describe("updateReqChanges", () => {
	const dynamoGet = new DynamoGet();
	const dynamoReset = new DynamoReset();
	const dynamoAppend = new DynamoAppend();

	const slackTeam = json.Departments.Devs.DevTeam1.Slack_Group;
	const slackLead1 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
	const slackLead2 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
	const slackLead3 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
	const slackMember1 =
		json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
	const slackMember2 =
		json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
	const slackMember3 =
		json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3;

	beforeEach(async () => {
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);
	});

	afterEach(async () => {
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);
	});

	it("member request changes, member before lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner should be up to date with Team queue
		// Since another user requested changes
		expect(member1Queue).deep.equal(teamQueue);

		// PR ReqChanges user should have an empty queue
		expect(member2Queue).deep.equal([]);

		// Members 3, 4, etc. should match team queue
		expect(member3Queue).deep.equal(teamQueue);

		// Leads should have empty queues
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("member request changes, member before lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner should be up to date with Team queue
		// since another user requested changes
		expect(member1Queue).deep.equal(teamQueue);

		// PR ReqChanges user should have an empty queue
		expect(member2Queue).deep.equal([]);

		// Members 3, 4, etc. should be empty
		expect(member3Queue).deep.equal([]);

		// Expect lead queues to be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member before lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Expect team queue to be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// Expect PR owner to match team queue
		// since another user requsted changes
		expect(member1Queue).deep.equal(teamQueue);

		// Members 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Expect all lead queues to be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member before lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Expect team queue to be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// Expect PR owner to match team queue
		// since another user requsted changes
		expect(member1Queue).deep.equal(teamQueue);

		// Members 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Expect all lead queues to be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("member request changes, member before lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Other member queues should be alerted
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("member request changes, member before lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Other member queues should be alerted
		expect(member3Queue).deep.equal([]);

		// Lead queues should be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member before lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Expect team queue to be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner's queue should match team queue
		// Since lead requested changes
		expect(member1Queue).deep.equal(teamQueue);

		// Members 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member before lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Expect team queue to be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner's queue should match team queue
		// Since lead requested changes
		expect(member1Queue).deep.equal(teamQueue);

		// Members 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	// member & lead
	it("member request changes, member & lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead1.Slack_Id,
			slackLead2.Slack_Id,
			slackLead3.Slack_Id,
		]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Other member queues should be alerted
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("member request changes, member & lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead1.Slack_Id,
			slackLead2.Slack_Id,
			slackLead3.Slack_Id,
		]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Member queues 2, 3, etc. should be empty
		expect(member3Queue).deep.equal([]);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("member request changes, member & lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead1.Slack_Id,
			slackLead2.Slack_Id,
			slackLead3.Slack_Id,
		]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Member queues 2, 3, etc. should match team queue
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("member request changes, member & lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([
			slackMember2.Slack_Id,
		]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead1.Slack_Id,
			slackLead2.Slack_Id,
			slackLead3.Slack_Id,
		]);
		expect(teamQueue[0].leads_req_changes).deep.equal([]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// User requesting changes queue should be empty
		expect(member2Queue).deep.equal([]);

		// Member queues 2, 3, etc. should match team queue
		expect(member3Queue).deep.equal([]);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("lead request changes, member & lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// Member queues 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member & lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;

		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// Member queues 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member & lead (2 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// Member queues 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should match team queue
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead request changes, member & lead (1 Req)", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			members_req_changes: [],
			standard_leads_alert: [slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/aws/firecracker",
			},
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateReqChanges(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		const teamQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
		);
		const lead1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
		);
		const lead2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
		);
		const lead3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
		);
		const member1Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
		);
		const member2Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
		);
		const member3Queue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
		);

		// Team queue should be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2.Slack_Id,
			slackMember3.Slack_Id,
			slackMember1.Slack_Id,
		]);
		expect(teamQueue[0].members_req_changes).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);
		expect(teamQueue[0].events[0].action).equal("OPENED");
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner queue should match team queue
		expect(member1Queue).deep.equal(teamQueue);

		// Lead requesting changes should be empty
		expect(lead1Queue).deep.equal([]);

		// Member queues 2, 3, etc. should match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);

		// lead queues should match team queue
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});
});
