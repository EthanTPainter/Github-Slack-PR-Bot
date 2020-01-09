import { assert } from "chai";
import { findPrInQueues } from "../../../../../src/dynamo/update/types/helpers/find-pr-in-queues";

describe("findPrInQueues", () => {
	it("should find pr in user queue", () => {
		const prUrl = "www.github.com/pull/1";
		const user = {
			Slack_Id: "<Id>>",
			Slack_Name: "Name1",
		};
		const userQueue = [
			{
				url: prUrl,
			},
		];
		const team = {
			Slack_Id: "<Id2>",
			Slack_Name: "Name2",
		};
		const teamQueue = [
			{
				url: "N/A",
			},
		];

		const result = findPrInQueues(
			prUrl,
			user,
			userQueue as any,
			team,
			teamQueue as any,
		);
		const expected = userQueue[0];

		assert.deepEqual(result, expected);
	});
	it("should find pr in team queue", () => {
		const prUrl = "www.github.com/pull/1";
		const user = {
			Slack_Id: "<Id>>",
			Slack_Name: "Name1",
		};
		const userQueue = [
			{
				url: "N/A",
			},
		];
		const team = {
			Slack_Id: "<Id2>",
			Slack_Name: "Name2",
		};
		const teamQueue = [
			{
				url: prUrl,
			},
		];

		const result = findPrInQueues(
			prUrl,
			user,
			userQueue as any,
			team,
			teamQueue as any,
		);
		const expected = teamQueue[0];

		assert.deepEqual(result, expected);
	});
	it("should throw an error when can't find pr in user or team queues", () => {
		const prUrl = "www.github.com/pull/1";
		const user = {
			Slack_Id: "<Id>>",
			Slack_Name: "Name1",
		};
		const userQueue = [
			{
				url: "N/A",
			},
		];
		const team = {
			Slack_Id: "<Id2>",
			Slack_Name: "Name2",
		};
		const teamQueue = [
			{
				url: "N/A",
			},
		];

		try {
			findPrInQueues(prUrl, user, userQueue as any, team, teamQueue as any);
			assert.fail();
		} catch (error) {
			// Make sure user and team names are present in the error message
      assert.instanceOf(error, Error);
      assert.isTrue(error.message.includes(prUrl));
			assert.isTrue(error.message.includes(user.Slack_Name));
			assert.isTrue(error.message.includes(team.Slack_Name));
		}
	});
});
