import { expect } from "chai";

import { json } from "../../../json";
import { requiredEnvs } from "../../../../../src/required-envs";
import {
	DynamoGet,
	DynamoReset,
	DynamoUpdate,
} from "../../../../../src/dynamo/api";
import { updateComment } from "../../../../../src/dynamo/update";
import { Settings } from "luxon";
import { createISO } from "../../../../../src/dynamo/time";

describe("Update.DynamoComment", () => {
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

	it("should update a PR with a commented action from owner -- alert members before leads", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();
		const currentTime = createISO();
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
		const openedPR = {
			owner: slackMember1,
			title: "ORIGINAL TITLE",
			url: "www.github.com/coveros",
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
				title: "NEW TITLE",
				html_url: "www.github.com/coveros",
			},
		};

		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			openedPR,
		);

		await updateComment(
			slackMember1,
			slackMember1,
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

		// Expect team queue to have both events
		expect(teamQueue[0].events[0].action).equal(openedPR.events[0].action);
		expect(teamQueue[0].events[1].action).equal("COMMENTED");
		expect(teamQueue[0].comment_times).deep.equal({
			[slackMember1.Slack_Id]: currentTime,
		});

		// Expect lead queues to be empty (not alerted)
		expect(lead1Queue).deep.equal([]);
		expect(lead2Queue).deep.equal([]);
		expect(lead3Queue).deep.equal([]);

		// Expect member 1 queue to be empty (PR owner)
		expect(member1Queue).deep.equal([]);

		// Expect members 2 & 3 queues to have both events
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});

	it("should update a PR with a commented action from owner -- alert members & leads", async () => {
		// Set Date & time
		Settings.now = (): number => new Date(2019, 3, 1).valueOf();
		const currentTime = createISO();
		json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
		const openedPR = {
			owner: slackMember1,
			title: "ORIGINAL TITLE",
			url: "www.github.com/coveros",
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
				title: "NEW TITLE",
				html_url: "www.github.com/coveros",
			},
		};

		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackTeam,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember2,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackMember3,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead1,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead2,
			[],
			openedPR,
		);
		await dynamoUpdate.updatePullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackLead3,
			[],
			openedPR,
		);

		await updateComment(
			slackMember1,
			slackMember1,
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

		// Expect team queue to have both events
		expect(teamQueue[0].events[0].action).equal(openedPR.events[0].action);
		expect(teamQueue[0].events[1].action).equal("COMMENTED");
		expect(teamQueue[0].comment_times).deep.equal({
			[slackMember1.Slack_Id]: currentTime,
		});

		// Expect lead queues to have both events
		expect(lead1Queue).deep.equal(teamQueue);
		expect(lead2Queue).deep.equal(teamQueue);
		expect(lead3Queue).deep.equal(teamQueue);

		// Expect members 2 & 3 queues to have both events
		expect(member2Queue).deep.equal(teamQueue);
		expect(member3Queue).deep.equal(teamQueue);
	});
});
