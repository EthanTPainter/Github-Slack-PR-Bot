import { expect, assert } from "chai";
import { PullRequest } from "../../../../src/models";
import { formatMyQueue } from "../../../../src/dynamo/formatting/format-my-queue";

describe("formatMyQueue", () => {
	let json: any;

	beforeEach(() => {
		json = {
			Departments: {
				Devs: {
					DTeam: {
						Options: {
							Queue_Include_Created_Time: true,
							Queue_Include_Updated_Time: true,
						},
						Users: {
							Leads: {
								Ethan: {
									Slack_Name: "ethan.painter",
									Slack_Id: "<@12345>",
								},
							},
							Members: {
								Daniel: {
									Slack_Name: "daniel.larner",
									Slack_Id: "<@23456>",
								},
								Dillon: {
									Slack_Name: "Dillon.sykes",
									Slack_Id: "<9999>",
								},
							},
						},
					},
				},
			},
		};
	});

	it("should format a queue with one PR", () => {
		const queue: PullRequest[] = [
			{
				owner: {
					Slack_Name: "ethan.painter",
					Slack_Id: "<@12345>",
				},
				title: "feat(1234): New feature",
				url: "www.github.com/ethantpainter",
				comment_times: {},
				standard_members_alert: [
					{
						Slack_Id: "<@23456>",
						Slack_Name: "DillonS",
					},
				],
				standard_leads_alert: [],
				member_complete: false,
				members_approving: [],
				lead_complete: false,
				leads_approving: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						user: {
							Slack_Name: "EthanP",
							Slack_Id: "<@1234>",
						},
						action: "APPROVED",
						time: "NOW",
					},
				],
			},
		];

		const slackUser = json.Departments.Devs.DTeam.Users.Members.Dillon;
		const submittedUserId = `<@${slackUser.Id}>`;
		const result = formatMyQueue(submittedUserId, slackUser, queue, json);

		expect(result.includes(queue[0].title)).equal(true);
		expect(result.includes(queue[0].url)).equal(true);
		expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
		expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);
	});

	it("should format a queue with two PRs", () => {
		const queue: PullRequest[] = [
			{
				owner: {
					Slack_Name: "ethan.painter",
					Slack_Id: "<@12345>",
				},
				title: "feat(1234): New feature",
				url: "www.github.com/ethantpainter",
				comment_times: {},
				standard_members_alert: [
					{
						Slack_Id: "<@23456>",
						Slack_Name: "Matt",
					},
				],
				standard_leads_alert: [],
				member_complete: false,
				members_approving: [],
				lead_complete: false,
				leads_approving: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						user: {
							Slack_Name: "EthanP",
							Slack_Id: "<@543>",
						},
						action: "APPROVED",
						time: "FIRST",
					},
				],
			},
			{
				owner: {
					Slack_Name: "daniel.larner",
					Slack_Id: "<@23456>",
				},
				title: "feat(12346): New feature 2",
				url: "www.github.com/daniellarner",
				comment_times: {},
				standard_members_alert: [
					{
						Slack_Id: "<@23456>",
						Slack_Name: "Daniel"
					,}
				],
				standard_leads_alert: [],
				member_complete: false,
				members_approving: [],
				lead_complete: false,
				leads_approving: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [
					{
						user: {
							Slack_Name: "EthanP",
							Slack_Id: "<@666>",
						},
						action: "APPROVED",
						time: "NOW",
					},
				],
			},
		];
		const slackUser = json.Departments.Devs.DTeam.Users.Members.Dillon;
		const submittedUserId = slackUser.Id;
		const result = formatMyQueue(submittedUserId, slackUser, queue, json);

		expect(result.includes(queue[0].title)).equal(true);
		expect(result.includes(queue[0].url)).equal(true);
		expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
		expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);

		expect(result.includes(queue[1].title)).equal(true);
		expect(result.includes(queue[1].url)).equal(true);
		expect(result.includes("Created: " + queue[1].events[0].time)).equal(true);
		expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);
	});

	it("should format an empty queue -- queue belongs to the requester", () => {
		const queue: PullRequest[] = [];
		const slackUser = json.Departments.Devs.DTeam.Users.Members.Dillon;
    const submittedUserID = slackUser.Slack_Id;

    const result = formatMyQueue(submittedUserID, slackUser, queue, json);
    const expected = "Nothing found in your queue";

    assert.equal(result, expected);
  });
  
  it("should format an empty queue -- queue doesn't belong to the requester", () => {
    const queue: PullRequest[] = [];
    const slackUser = json.Departments.Devs.DTeam.Users.Members.Dillon;
    const submittedUserID = json.Departments.Devs.DTeam.Users.Daniel;

    const result = formatMyQueue(submittedUserID, slackUser, queue, json);
    const expected = `Nothing found in ${slackUser.Slack_Name}'s queue`;

    assert.equal(result, expected);
  });
});
