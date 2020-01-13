import { assert } from "chai";

import { json } from "./../../../json";
import { PullRequest } from "../../../../../src/models";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateRequestMoreChanges } from "../../../../../src/dynamo/update";
import {
	DynamoGet,
	DynamoUpdate,
	DynamoReset,
} from "../../../../../src/dynamo/api";

describe("updateRequestMoreChanges", () => {
	const dynamoGet = new DynamoGet();
	const dynamoUpdate = new DynamoUpdate();
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

	describe("1 required member approval, 1 required lead approval", () => {
		it("Member already requesting changes, owner (member) should still be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember1],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			// Result should be valid
			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackMember2.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${slackMember1.Slack_Id}`,
			);

			// Team and PR owner should still be the only alerted
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue, []);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
		it("Member already requesting changes, owner (lead) should still be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackLead1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [slackLead1],
				standard_members_alert: [],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackLead1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackLead1,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackMember2.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${initalPr.owner.Slack_Id}`,
			);

			// Team and PR owner should be the same
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue, []);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue, []);
			assert.deepEqual(lead1Queue[0], initalPr);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
		it("Member approving, lead requesting changes, owner (member) should be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [slackMember2],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember1],
				leads_req_changes: [slackLead1],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "APPROVED",
						time: "BACK THEN",
						user: slackMember2,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "RECENTLY",
						user: slackLead1,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackLead1,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackLead1.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${slackMember1.Slack_Id}`,
			);

			// Only the team and
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue, []);
		});
		it("Lead approving, lead requesting changes, owner (member) and all members should be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [slackLead1],
				standard_leads_alert: [],
				standard_members_alert: [slackMember2, slackMember3, slackMember1],
				leads_req_changes: [slackLead2],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "APPROVED",
						time: "BACK THEN",
						user: slackLead1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "RECENTLY",
						user: slackLead2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember2,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember3,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackLead2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackLead2.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${slackMember1.Slack_Id}`,
			);

			// Team and member queues should all be alerted
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue[0], initalPr);
			assert.deepEqual(member3Queue[0], initalPr);

			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
	});

	describe("2 required member approvals", () => {
		it("Member already requesting changes, all other members and owner (member) should be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember3, slackMember1],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember3,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackMember2.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${slackMember1.Slack_Id}`,
			);

			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue[0], initalPr);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
		it("Member already requesting changes, all other members and owner (lead) should be alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackLead1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [slackLead1],
				standard_members_alert: [slackMember1, slackMember3],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackLead1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackLead1,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember3,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackMember2.Slack_Name} has requested more changes with ${initalPr.url}. Owner: ${slackLead1.Slack_Id}`,
			);

			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(lead1Queue[0], initalPr);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue[0], initalPr);
		});
		it("Member alerted about fixed PR requesting changes, all other members and owner (member) are alerted", async () => {
			const initalPr: PullRequest = {
				owner: slackMember3,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember1],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [slackMember2],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember3,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
					{
						action: "FIXED_PR",
						time: "RECENT",
						user: slackMember3,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember2,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			assert.equal(result.failure, false);
			assert.equal(
				result.response,
				`${slackMember2.Slack_Name} has requested changes on a previously fixed PR. Owner: ${slackMember3.Slack_Id}`,
			);

			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue[0], initalPr);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
	});

	describe("Failure cases", () => {
		it("PR URL not found in team's queue", async () => {
			const providedUrl = "www.github.com/ORG/REPO2/pull/123";
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember1],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember2,
				providedUrl,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			// Result should be a failure
			assert.equal(
				result.response,
				`Provided PR Url: ${providedUrl} not found in ${slackTeam.Slack_Name}'s queue`,
			);
			assert.deepEqual(result.failure, true);

			// Team and PR owners should be the same
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue, []);
		});
		it("User using command is not requesting changes or alerted from a fixed PR", async () => {
			const initalPr: PullRequest = {
				owner: slackMember1,
				comment_times: {},
				title: "PR TITLE",
				url: "www.github.com/ORG/REPO/pull/123",
				lead_complete: false,
				member_complete: false,
				members_approving: [],
				leads_approving: [],
				standard_leads_alert: [],
				standard_members_alert: [slackMember1],
				leads_req_changes: [],
				members_req_changes: [slackMember2],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						action: "OPENED",
						time: "WAY BACK WHEN",
						user: slackMember1,
					},
					{
						action: "CHANGES_REQUESTED",
						time: "BACK THEN",
						user: slackMember2,
					},
				],
			};

			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackTeam,
				[],
				initalPr,
			);
			await dynamoUpdate.updatePullRequest(
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
				slackMember1,
				[],
				initalPr,
			);

			const result = await updateRequestMoreChanges(
				slackMember3,
				initalPr.url,
				requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
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

			// Result should include a failure
			assert.equal(result.failure, true);
			assert.equal(
				result.response,
				`To use this command, you must already be requesting changes or alerted about a fixed PR for ${initalPr.url}`,
			);

			// Only the team queue and the pr owner should have alerts
			assert.deepEqual(teamQueue[0], initalPr);
			assert.deepEqual(member1Queue[0], initalPr);
			assert.deepEqual(member2Queue, []);
			assert.deepEqual(member3Queue, []);
			assert.deepEqual(lead1Queue, []);
			assert.deepEqual(lead2Queue, []);
			assert.deepEqual(lead3Queue, []);
		});
	});
});
