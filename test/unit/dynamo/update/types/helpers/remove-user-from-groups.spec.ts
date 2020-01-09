import { assert } from "chai";

import { removeUserFromGroups } from "../../../../../../src/dynamo/update/types/helpers";
import { PullRequest } from "../../../../../../src/models";

describe("removeUserFromGroups", () => {
	const slackUser1 = {
		Slack_Id: "<SlackUser1>",
		Slack_Name: "User 1",
	};
	const slackUser2 = {
		Slack_Id: "<SlackUser2>",
		Slack_Name: "User 2",
	};
	const slackUser3 = {
		Slack_Id: "<SlackUser3>",
		Slack_Name: "User 3",
	};

	it("Should remove user from standard lead alerts", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: changed,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from standard member alerts", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: changed,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from req changes leads alert", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: changed,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from req changes members alert", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: changed,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from leads approving", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: changed,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from members approving", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: changed,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from leads req changes", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: changed,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from members req changes", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: remain,
			standard_members_alert: remain,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: changed,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from two groups", () => {
		const changed = [slackUser1, slackUser2, slackUser3];
		const remain = [slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: changed,
			standard_members_alert: changed,
			req_changes_leads_alert: remain,
			req_changes_members_alert: remain,
			leads_approving: remain,
			members_approving: remain,
			leads_req_changes: remain,
			members_req_changes: remain,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});

	it("Should remove user from every group", () => {
		const changed = [slackUser1, slackUser2, slackUser3];

		const pr: PullRequest = {
			standard_leads_alert: changed,
			standard_members_alert: changed,
			req_changes_leads_alert: changed,
			req_changes_members_alert: changed,
			leads_approving: changed,
			members_approving: changed,
			leads_req_changes: changed,
			members_req_changes: changed,
		} as any;

		const result = removeUserFromGroups(pr, slackUser1);
		const expected = [slackUser2, slackUser3];

		assert.deepEqual(result.standard_leads_alert, expected);
		assert.deepEqual(result.standard_members_alert, expected);
		assert.deepEqual(result.req_changes_leads_alert, expected);
		assert.deepEqual(result.req_changes_members_alert, expected);
		assert.deepEqual(result.leads_approving, expected);
		assert.deepEqual(result.members_approving, expected);
		assert.deepEqual(result.leads_req_changes, expected);
		assert.deepEqual(result.members_req_changes, expected);
	});
});
