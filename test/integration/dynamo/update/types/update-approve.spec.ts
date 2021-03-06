import { expect } from "chai";
import { json } from "../../../json";
import {
	DynamoGet,
	DynamoAppend,
	DynamoReset,
} from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateApprove } from "../../../../../src/dynamo/update";

describe("Dynamo.UpdateApprove", () => {
	const dynamoGet = new DynamoGet();
	const dynamoAppend = new DynamoAppend();
	const dynamoReset = new DynamoReset();

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

	// Reset queue for all slack users before each test
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

	// Reset each queue after all tests complete
	after(async () => {
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

	// Standard tests -- Lead OR Member approving WITH different # required approvals
	it("member approves -- 2 req member approvals & alert members before leads", async () => {
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

		await updateApprove(
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

		// PR Owner should not have anything in their queue
		expect(member1Queue).deep.equal([]);

		// PR Approver should not have any PRs in their queue
		expect(member2Queue).deep.equal([]);

		// Still need a member approval. Member 3, 4, etc.
		// should have this PR in their queue
		expect(member3Queue[0].url).equal(newPR.url);
		expect(member3Queue[0].member_complete).equal(false);
		expect(member3Queue[0].members_approving).deep.equal([slackMember2]);
		expect(member3Queue[0].standard_members_alert).deep.equal([slackMember3]);
		expect(member3Queue[0].events[0].action).equal(newPR.events[0].action);
		expect(member3Queue[0].events[0].user).deep.equal(slackMember1);
		expect(member3Queue[0].events[1].action).equal("APPROVED");
		expect(member3Queue[0].events[1].user).deep.equal(slackMember2);

		// Expect lead queues to be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// Expect team queue to be updated with approved PR
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
	});

	it("member approves -- 1 req member approval & alert members before leads", async () => {
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
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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

		await updateApprove(
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

		// Team queue should be updated
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR owner should have an empty queue
		expect(member1Queue).deep.equal([]);

		// PR approver should have an empty queue
		expect(member2Queue).deep.equal([]);

		// Since 1 required member approval was met
		// member 3, 4, etc. should not have PR in their queue
		expect(member3Queue).deep.equal([]);

		// All leads should have this PR in each queue (match team queue)
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("lead approves  -- 2 req lead approvals & alert members before leads", async () => {
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
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2,
			slackMember3,
		]);

		// PR owner should not be alerted
		expect(member1Queue).deep.equal([]);

		// PR approver and all leads should have empty queues
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// Members 2, 3, 4, etc. should have same queues as team
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});

	it("lead approves -- 1 req lead approval & alert members before leads", async () => {
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
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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

		await updateApprove(
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

		// PR owner queue should be empty
		expect(member1Queue).deep.equal([]);

		// PR approver's queue is empty since approver was a lead
		// and members before leads option is true
		expect(lead1Queue).deep.equal([]);

		// Other lead queues should also be empty
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// Slack members should all be alerted
		// 2, 3, 4, etc.
		expect(member2Queue[0].url).equal(newPR.url);
		expect(member2Queue[0].lead_complete).equal(true);
		expect(member2Queue[0].leads_approving).deep.equal([slackLead1]);
		expect(member2Queue[0].standard_leads_alert).deep.equal([]);
		expect(member2Queue[0].member_complete).equal(false);
		expect(member2Queue[0].members_approving).deep.equal([]);
		expect(member2Queue[0].standard_members_alert).deep.equal([
			slackMember2,
			slackMember3,
		]);
		expect(member3Queue).deep.equal(member2Queue);

		// Team queue should match user queue
		expect(teamQueue).deep.equal(member3Queue);
	});

	it("member approves -- 2 req member approvals & alert members & leads", async () => {
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
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackLead1,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateApprove(
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

		// Team queue should have an updated queue
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR owner should have an empty queue
		expect(member1Queue).deep.equal([]);

		// PR approver should have an empty queue
		expect(member2Queue).deep.equal([]);

		// Other members should still be alerted
		expect(member3Queue).deep.equal(teamQueue);

		// Expect lead queues to be the same as team queue
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("member approves -- 1 req member approvals & alert members & leads", async () => {
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
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackLead1,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateApprove(
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

		// Team queue should have an updated queue
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([]);
		expect(teamQueue[0].standard_leads_alert).deep.equal(
			newPR.standard_leads_alert,
		);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);

		// PR Owner queue should be empty
		expect(member1Queue).deep.equal([]);

		// PR approver queue should be emoty
		expect(member2Queue).deep.equal([]);

		// Members 3, 4, etc. should all have empty queues
		expect(member3Queue).deep.equal([]);

		// Expect lead queues to be same as team queues
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("lead approves -- 2 req lead approvals & alert members & leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackLead1,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateApprove(
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
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead2,
			slackLead3,
		]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2,
			slackMember3,
		]);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// Expect PR owner's queue to be empty
		expect(member1Queue).deep.equal([]);

		// Expect all lead queues to match team queue
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);

		// Expect members 2, 3, 4, etc. to have queues match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});

	it("lead approves -- 1 req lead approval & alert members & leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackLead1,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			newPR,
		);
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			newPR,
		);

		await updateApprove(
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
		expect(teamQueue[0].lead_complete).equal(true);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([]);
		expect(teamQueue[0].standard_members_alert).deep.equal([
			slackMember2,
			slackMember3,
		]);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);

		// PR Owner's queue should be empoty
		expect(member1Queue).deep.equal([]);

		// Expect all lead queues to be empty
		expect(lead1Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// Expect members 2, 3, 4, etc. to match team queue
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});

	// Consecutive tests -- Member approves & lead approves OR Lead approves & Member approves
	it("member approves, lead approves -- 2 req lead, 2 req member & alert members before leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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

		// Expect the team queue to be up to date
		expect(teamQueue[0].url).equal(newPR.url);
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackLead1);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);

		// PR Owner should have an empty queue
		expect(member1Queue).deep.equal([]);

		// PR Approvers should have empty queues
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// All other member queues should match team queue
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues are empty
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("member approves, lead approves -- 1 req lead, 2 req member & alert members before leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
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
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackLead1);
		expect(teamQueue[0].lead_complete).equal(true);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);

		// PR Owner's queue should be empty
		expect(member1Queue).deep.equal([]);

		// PR Approvers should have empty queue
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// Members should be alerted
		expect(member3Queue).deep.equal(teamQueue);

		// Lead queues should be empty
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("member approves, lead approves -- 2 req lead, 1 req member & alert members before leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackLead1);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead2,
			slackLead3,
		]);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);

		// PR Owner queue should be empty
		expect(member1Queue).deep.equal([]);

		// PR member approver & other member queues are empty
		expect(member1Queue).deep.equal([]);
		expect(member2Queue).deep.equal([]);
		expect(member3Queue).deep.equal([]);

		// PR lead approver queue should be empty
		expect(lead1Queue).deep.equal([]);

		// Other lead queues match team queue
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("member approves, lead approves -- 1 req lead, 1 req member & alert members before leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
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
			standard_leads_alert: [],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackMember2,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackLead1);
		expect(teamQueue[0].lead_complete).equal(true);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);

		// PR Owner queue is empty
		expect(member1Queue).deep.equal([]);

		// PR approvers queues are empty
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// All member & lead queues are empty
		expect(member3Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});

	it("lead approves, member approves -- 2 req lead, 2 req member & alert members & leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackMember2);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead2,
			slackLead3,
		]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);

		// PR owner's queue is empty
		expect(member1Queue).deep.equal([]);

		// PR approver queues are empty
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// All other members and leads match team queue
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});

	it("lead approves, member approves -- 1 req lead, 2 req member & alert members & leads", async () => {
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
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackMember2);
		expect(teamQueue[0].lead_complete).equal(true);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(false);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3]);

		// PR owner's queue is empty
		expect(member1Queue).deep.equal([]);

		// PR approver queues are empty
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// All other lead queues should be empty
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// All members match team queue
		expect(member3Queue).deep.equal(teamQueue);
	});

	it("lead approves, member approves -- 2 req lead, 1 req member & alert members & leads", async () => {
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
		const newPR = {
			owner: slackMember1,
			title: "VALID PR TITLE #1",
			url: "www.github.com/aws/firecracker",
			comment_times: {},
			standard_members_alert: [slackMember2, slackMember3],
			members_approving: [],
			member_complete: false,
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackMember2);
		expect(teamQueue[0].lead_complete).equal(false);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([
			slackLead2,
			slackLead3,
		]);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);

		// PR Owner queue is empty
		expect(member1Queue).deep.equal([]);

		// PR Approvers queues are empty
		expect(lead1Queue).deep.equal([]);
		expect(member2Queue).deep.equal([]);

		// Member queues should be empty
		expect(member3Queue).deep.equal([]);

		// Lead queues should match team queue
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);
	});

	it("lead approves, member approves -- 1 req lead, 1 req member & alert members & leads", async () => {
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
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			leads_approving: [],
			lead_complete: false,
			leads_req_changes: [],
			members_req_changes: [],
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
			slackTeam,
			[],
			newPR,
		);
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

		await updateApprove(
			slackMember1,
			slackLead1,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		await updateApprove(
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
		expect(teamQueue[0].events[0].action).equal(newPR.events[0].action);
		expect(teamQueue[0].events[0].user).deep.equal(newPR.events[0].user);
		expect(teamQueue[0].events[1].action).equal("APPROVED");
		expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
		expect(teamQueue[0].events[2].action).equal("APPROVED");
		expect(teamQueue[0].events[2].user).deep.equal(slackMember2);
		expect(teamQueue[0].lead_complete).equal(true);
		expect(teamQueue[0].leads_approving).deep.equal([slackLead1]);
		expect(teamQueue[0].standard_leads_alert).deep.equal([]);
		expect(teamQueue[0].member_complete).equal(true);
		expect(teamQueue[0].members_approving).deep.equal([slackMember2]);
		expect(teamQueue[0].standard_members_alert).deep.equal([]);

		// PR owner queue should be empty
		expect(member1Queue).deep.equal([]);

		// PR approver queues should be empty
		expect(member2Queue).deep.equal([]);
		expect(lead1Queue).deep.equal([]);

		// All member and lead queues should be empty
		expect(member3Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);
	});
});
