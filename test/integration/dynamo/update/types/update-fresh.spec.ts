import { assert } from "chai";

import { json } from "../../../json";
import {
	DynamoGet,
	DynamoReset,
	DynamoUpdate,
} from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";
import { Settings } from "luxon";
import { PullRequest, SlackUser } from "../../../../../src/models";
import { updateFresh } from "../../../../../src/dynamo/update";

// should update a PR when a push to a PR is made --
describe("Dynamo.UpdateFresh", () => {
	const dynamoGet = new DynamoGet();
	const dynamoReset = new DynamoReset();
	const dynamoUpdate = new DynamoUpdate();

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

	// Prior users who requested changes & alerting
	it("Member who requested changes is still requesting changes", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [slackMember2],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [],
			standard_members_alert: [slackMember1],
			leads_approving: [],
			members_approving: [slackMember3],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember3,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackMember2,
					action: "CHANGES_REQUESTED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedMembersApproving: SlackUser[] = [];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember3, slackMember1];
		const expectedStandardLeadsAlert: SlackUser[] = [];
		const expectedMembersRequestingChanges = [slackMember2];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].members_req_changes,
			expectedMembersRequestingChanges,
		);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should have this in their queue because of the requested changes
		assert.deepEqual(member1Queue, teamQueue);

		// Lead queues should all be empty
		assert.deepEqual(lead1Queue, []);
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member 2's queue should be empty (requesting changes)
		assert.deepEqual(member2Queue, []);

		// Member queues should match the team queue
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("Lead who requested changes is still requesting changes", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [slackLead1],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [],
			standard_members_alert: [slackMember2, slackMember3, slackMember1],
			leads_approving: [slackLead2],
			members_approving: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackLead2,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackLead1,
					action: "CHANGES_REQUESTED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember1,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedMembersApproving: SlackUser[] = [];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedStandardMembersAlert = [
			slackMember2,
			slackMember3,
			slackMember1,
		];
		const expectedStandardLeadsAlert = [slackLead2];
		const expectedLeadsRequestingChanges = [slackLead1];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].leads_req_changes,
			expectedLeadsRequestingChanges,
		);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should have the PR in their queue since lead1 is requesting changes
		assert.deepEqual(member1Queue, teamQueue);

		// Lead 1 queue should be empty since they're requesting changes
		assert.deepEqual(lead1Queue, [])
	
		// Lead queues should match the team queue
		assert.deepEqual(lead2Queue, teamQueue);
		assert.deepEqual(lead3Queue, []);

		// Member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("Alerted member who requested changes is still alerted", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [slackMember2],
			standard_leads_alert: [],
			standard_members_alert: [],
			leads_approving: [],
			members_approving: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "CHANGES_REQUESTED",
					time: "NOW",
				},
				{
					user: slackMember1,
					action: "FIXED_PR",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedMembersApproving: SlackUser[] = [];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedStandardMembersAlert: SlackUser[] = [];
		const expectedReqChangesMembersAlert = [slackMember2];
		const expectedStandardLeadsAlert: SlackUser[] = [];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].req_changes_members_alert,
			expectedReqChangesMembersAlert,
		);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should not have this PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should match the team queue
		assert.deepEqual(lead1Queue, []);
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member alerted about fixed changes should match the team queue
		assert.deepEqual(member2Queue, teamQueue);

		// Member queues should be empty
		assert.deepEqual(member3Queue, []);
	});

	it("Alerted lead who requested changes is still alerted", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [slackLead1],
			req_changes_members_alert: [],
			standard_leads_alert: [],
			standard_members_alert: [slackMember2, slackMember3],
			leads_approving: [],
			members_approving: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackLead1,
					action: "CHANGES_REQUESTED",
					time: "NOW",
				},
				{
					user: slackMember1,
					action: "FIXED_PR",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedMembersApproving: SlackUser[] = [];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];
		const expectedReqChangesMembersAlert: SlackUser[] = [];
		const expectedReqChangesLeadsAlert = [slackLead1];
		const expectedStandardLeadsAlert: SlackUser[] = [];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].req_changes_members_alert,
			expectedReqChangesMembersAlert,
		);
		assert.deepEqual(
			teamQueue[0].req_changes_leads_alert,
			expectedReqChangesLeadsAlert,
		);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should not have this PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead who requested changes should be alerted since PR was fixed
		assert.deepEqual(lead1Queue, teamQueue);

		// Other lead queues should be empty
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	// Member_Before_Lead = true
	it("Member_Before_Lead, 1 member approval, and 2 required member approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [],
			standard_members_alert: [slackMember3],
			leads_approving: [],
			members_approving: [slackMember2],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(teamQueue[0].events[2], expectedNewEvent);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should be empty since only members are alerted
		assert.equal(lead1Queue.length, 0);
		assert.equal(lead2Queue.length, 0);
		assert.equal(lead3Queue.length, 0);

		// Member queues should all match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("Member_Before_Lead, 1 lead approval, 2 required member approvals, and 2 required lead approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [],
			standard_members_alert: [slackMember2, slackMember3],
			leads_approving: [slackLead1],
			members_approving: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackLead1,
					action: "APPROVED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team, member, and lead queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		// Expected values to be true
		const expectedStandardLeadsAlert: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].events[2], expectedNewEvent);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should be empty
		assert.deepEqual(lead1Queue, []);
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member and Lead queues should match team
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("Member_Before_Lead, 2 members approvals, and 2 required member approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: true,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			standard_members_alert: [],
			leads_approving: [],
			members_approving: [slackMember2, slackMember3],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackMember3,
					action: "APPROVED",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardLeadsAlert: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.equal(alertSlack, true);

		// Team queue
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should be empty since only members should be alerted
		assert.deepEqual(lead1Queue, []);
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member queues should match team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("Member_Before_Lead, 1 member approval, 1 lead approval, 1 required member approval, and 1 required lead approval", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: true,
			lead_complete: true,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead1, slackLead2],
			standard_members_alert: [slackMember2],
			leads_approving: [slackLead3],
			members_approving: [slackMember3],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackLead3,
					action: "APPROVED",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		// Expected values to be valid
		const expectedStandardLeadsAlert: SlackUser[] = [];
		const expectedStandardMembersAlert = [slackMember3, slackMember2];
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedLeadComplete = false;
		const expectedMemberComplete = false;
		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].lead_complete, expectedLeadComplete);
		assert.deepEqual(teamQueue[0].member_complete, expectedMemberComplete);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues shouldn't have the PR in them
		assert.deepEqual(lead1Queue, []);
		assert.deepEqual(lead2Queue, []);
		assert.deepEqual(lead3Queue, []);

		// Member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	// Member_Before_Lead = false
	it("No Member_Before_Lead, 1 member approval, and 2 required member approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			standard_members_alert: [slackMember3],
			leads_approving: [],
			members_approving: [slackMember2],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardLeadsAlert: SlackUser[] = [
			slackLead1,
			slackLead2,
			slackLead3,
		];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].events[2], expectedNewEvent);

		// PR Owner should not have this PR in their queue
		assert.deepEqual(member1Queue, []);

		// All lead queues should match the team queue
		assert.deepEqual(lead1Queue, teamQueue);
		assert.deepEqual(lead2Queue, teamQueue);
		assert.deepEqual(lead3Queue, teamQueue);

		// All member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("No Member_Before_Lead, 1 lead approval, and 2 required member approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: false,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead2, slackLead3],
			standard_members_alert: [slackMember2, slackMember3],
			leads_approving: [slackLead1],
			members_approving: [],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackLead1,
					action: "APPROVED",
					time: "NOW",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardLeadsAlert: SlackUser[] = [
			slackLead1,
			slackLead2,
			slackLead3,
		];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.equal(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].events[2], expectedNewEvent);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should match the team queue
		assert.deepEqual(lead1Queue, teamQueue);
		assert.deepEqual(lead2Queue, teamQueue);
		assert.deepEqual(lead3Queue, teamQueue);

		// Member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("No Member_Before_Lead, 2 member approvals, and 2 required member approvals", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: true,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead1, slackLead2, slackLead3],
			standard_members_alert: [],
			leads_approving: [],
			members_approving: [slackMember2, slackMember3],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackMember3,
					action: "APPROVED",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardLeadsAlert: SlackUser[] = [
			slackLead1,
			slackLead2,
			slackLead3,
		];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.deepEqual(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should not have the PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should match team queue
		assert.deepEqual(lead1Queue, teamQueue);
		assert.deepEqual(lead2Queue, teamQueue);
		assert.deepEqual(lead3Queue, teamQueue);

		// Member queues should match team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});

	it("No Member_Before_Lead, 1 member approval, 1 lead approval, 1 required member approval, and 1 required lead approval", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();

		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
		json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;

		const currentPR: PullRequest = {
			owner: slackMember1,
			title: "TITLE",
			url: "www.github.com/org/repo/pull/1",
			comment_times: {},
			member_complete: true,
			lead_complete: false,
			members_req_changes: [],
			leads_req_changes: [],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			standard_leads_alert: [slackLead1, slackLead3],
			standard_members_alert: [slackMember3],
			leads_approving: [slackLead2],
			members_approving: [slackMember2],
			events: [
				{
					user: slackMember1,
					action: "OPENED",
					time: "THEN",
				},
				{
					user: slackLead2,
					action: "APPROVED",
					time: "NOW",
				},
				{
					user: slackMember2,
					action: "APPROVED",
					time: "NOW2",
				},
			],
		};
		const event = {
			pull_request: {
				html_url: "www.github.com/org/repo/pull/1",
			},
			repository: {
				name: "this-repository",
			},
		};

		// Update team and member queues
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			currentPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			currentPR,
		);

		// Update the PR based on fresh approval requirements
		const alertSlack = await updateFresh(
			slackMember1,
			slackTeam,
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			event,
			json,
		);

		// Get all queues
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

		const expectedNewEvent = {
			action: "PUSH",
			time: "April 1, 2019, 12:00:00 AM EDT",
			user: slackMember1,
		};
		const expectedLeadsApproving: SlackUser[] = [];
		const expectedMembersApproving: SlackUser[] = [];
		const expectedStandardLeadsAlert: SlackUser[] = [
			slackLead2,
			slackLead1,
			slackLead3,
		];
		const expectedStandardMembersAlert = [slackMember2, slackMember3];

		assert.deepEqual(alertSlack, true);

		// Team queue should be accurate
		assert.deepEqual(
			teamQueue[0].standard_leads_alert,
			expectedStandardLeadsAlert,
		);
		assert.deepEqual(
			teamQueue[0].standard_members_alert,
			expectedStandardMembersAlert,
		);
		assert.deepEqual(teamQueue[0].leads_approving, expectedLeadsApproving);
		assert.deepEqual(teamQueue[0].members_approving, expectedMembersApproving);
		assert.deepEqual(teamQueue[0].events[3], expectedNewEvent);

		// PR Owner should not this PR in their queue
		assert.deepEqual(member1Queue, []);

		// Lead queues should match the team queue
		assert.deepEqual(lead1Queue, teamQueue);
		assert.deepEqual(lead2Queue, teamQueue);
		assert.deepEqual(lead3Queue, teamQueue);

		// Member queues should match the team queue
		assert.deepEqual(member2Queue, teamQueue);
		assert.deepEqual(member3Queue, teamQueue);
	});
});
