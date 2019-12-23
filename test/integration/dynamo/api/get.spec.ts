import { DateTime } from "luxon";
import { expect } from "chai";
import { json } from "../../json";
import {
	DynamoReset,
	DynamoGet,
	DynamoAppend,
} from "../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../src/required-envs";

describe("Dynamo.Get", () => {
	const dynamoReset = new DynamoReset();
	const dynamoGet = new DynamoGet();
	const dynamoAppend = new DynamoAppend();
	const slackUser = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;

	// Reset slackUser's queue before each test
	beforeEach(async () => {
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser,
		);
	});

	// Reset slackUser's queue after all tests complete
	after(async () => {
		await dynamoReset.resetQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser,
		);
	});

	it("should get an empty queue from slack user", async () => {
		const currentQueue: any = [];

		const retrievedQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser,
		);

		expect(currentQueue).deep.equal(retrievedQueue);
	});

	it("should get a queue with one PR from slack user", async () => {
		const currentTime = DateTime.local().toLocaleString(
			DateTime.DATETIME_FULL_WITH_SECONDS,
		);
		const newPR = {
			owner: {
				Slack_Id: slackUser.Slack_Id,
				Slack_Name: slackUser.Slack_Name,
			},
			title: "VALID PR TITLE",
			url: "VALID PR URL",
			comment_times: {},
			standard_members_alert: [],
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
					user: slackUser,
					action: "OPENED",
					time: currentTime,
				},
			],
		};
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser.Slack_Id,
			[],
			newPR,
		);

		const expectedQueue = [newPR];
		const retrievedQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser,
		);

		expect(expectedQueue).deep.equal(retrievedQueue);
	});

	it("should get a queue with 2 PRs from slack user", async () => {
		const currentTime = DateTime.local().toLocaleString(
			DateTime.DATETIME_FULL_WITH_SECONDS,
		);
		const currentQueue = [
			{
				owner: {
					Slack_Id: slackUser.Slack_Id,
					Slack_Name: slackUser.Slack_Name,
				},
				title: "VALID PR TITLE #1",
				url: "VALID PR URL #1",
				comment_times: {},
				standard_members_alert: [],
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
						user: slackUser,
						action: "OPENED",
						time: currentTime,
					},
				],
			},
			{
				owner: {
					Slack_Id: slackUser.Slack_Id,
					Slack_Name: slackUser.Slack_Name,
				},
				title: "VALID PR TITLE #2",
				url: "VALID PR URL #2",
				comment_times: {},
				standard_members_alert: [],
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
						user: slackUser,
						action: "OPENED",
						time: currentTime,
					},
				],
			},
		];
		await dynamoAppend.appendPullRequest(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser.Slack_Id,
			[currentQueue[0]],
			currentQueue[1],
		);

		const expected = currentQueue;
		const retrievedQueue = await dynamoGet.getQueue(
			requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
			slackUser,
		);

		expect(expected).deep.equal(retrievedQueue);
	});
});
