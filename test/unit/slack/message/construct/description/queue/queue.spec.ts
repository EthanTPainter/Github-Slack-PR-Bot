import { expect } from "chai";
import { constructQueueString } from "../../../../../../../src/slack/message/construct/description";
import { PullRequest } from "../../../../../../../src/models";

describe("constructQueueString", () => {
	let pullRequest: PullRequest;

	beforeEach(() => {
		pullRequest = {
			owner: {
				Slack_Name: "User",
				Slack_Id: "<@12345>",
			},
			title: "Feature(123): Add new service",
			url: "www.github.com",
			comment_times: {},
			standard_members_alert: [
				{
					Slack_Id: "<@id123>",
					Slack_Name: "First Last",
				},
			],
			standard_leads_alert: [],
			member_complete: false,
			members_approving: [
				{
					Slack_Id: "<@id333>",
					Slack_Name: "EthanP",
				},
			],
			lead_complete: false,
			leads_approving: [
				{
					Slack_Id: "<@id444>",
					Slack_Name: "AndrewC",
				},
			],
			leads_req_changes: [
				{
					Slack_Id: "<@id555>",
					Slack_Name: "MDinks",
				},
			],
			members_req_changes: [
				{
					Slack_Id: "<@id666>",
					Slack_Name: "DillonS",
				},
			],
			req_changes_leads_alert: [],
			req_changes_members_alert: [],
			events: [
				{
					user: {
						Slack_Name: "EthanP",
						Slack_Id: "<@54321>",
					},
					action: "APPROVED",
					time: "FIRST",
				},
				{
					user: {
						Slack_Name: "AndrewC",
						Slack_Id: "<@444>",
					},
					action: "APPROVED",
					time: "NOW",
				},
			],
		};
	});

	it("should construct a queue string with new line, owner, approval names, created, & updated times", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true); // Expect newline & indent
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, owner, approval names, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, owner, approval names, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, owner, & approval names", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, owner, created, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, owner, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, owner, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, & owner", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, approval names, created, & updated times", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, approval names, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, approval names, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, & approval names", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, created, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with new line, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with new line", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: true,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(true);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`),
		).equal(false);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0]}]`,
			),
		).equal(false);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with owner, approval names, created, and updated times", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with owner, approval names, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with owner, approval names, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with owner, & approval names", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			true,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with owner, created time, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			true,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			true,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			true,
		);
	});

	it("should construct a queue string with owner and created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			true,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			true,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			false,
		);
	});

	it("should construct a queue string with owner and updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			true,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			false,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			true,
		);
	});

	it("should construct a queue string with same created and updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			false,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			true,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			true,
		);
	});

	it("should construct a queue string with only created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			false,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			true,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			false,
		);
	});

	it("should construct a queue string with only updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			false,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			false,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			true,
		);
	});

	it("should construct a queue string with only an owner", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: true,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			true,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			false,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			false,
		);
	});

	it("should construct a queue string with no options", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: false,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(
			false,
		);
		expect(result.includes("Created: " + pullRequest.events[0].time)).equal(
			false,
		);
		expect(result.includes("Updated: " + pullRequest.events[1].time)).equal(
			false,
		);
	});

	it("should construct a queue string with approval names, created, and updated times", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with approval names, & created time", () => {
		const options: any = {
			Queue_Include_Created_Time: true,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			true,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	it("should construct a queue string with approval names, & updated time", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: true,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			true,
		);
	});

	it("should construct a queue string with only approval names", () => {
		const options: any = {
			Queue_Include_Created_Time: false,
			Queue_Include_Updated_Time: false,
			Queue_Include_Owner: false,
			Queue_Include_New_Line: false,
			Queue_Include_Approval_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes(pullRequest.title)).equal(true);
		expect(result.includes(pullRequest.url)).equal(true);
		expect(result.includes("\n\t")).equal(false);
		expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(
			false,
		);
		expect(
			result.includes(
				`Leads Approving: [${pullRequest.leads_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(
			result.includes(
				`Members Approving: [${pullRequest.members_approving[0].Slack_Name}]`,
			),
		).equal(true);
		expect(result.includes(`Created: ${pullRequest.events[0].time}`)).equal(
			false,
		);
		expect(result.includes(`Updated: ${pullRequest.events[1].time}`)).equal(
			false,
		);
	});

	// Extra test added to cover including request changes
	it("should construct a queue string with members and leads requesting changes", () => {
		const options: any = {
			Queue_Include_Req_Changes_Names: true,
		};

		const result = constructQueueString(pullRequest, options);

		expect(result.includes("Leads Request Changes")).equal(true);
		expect(result.includes("Members Request Changes")).equal(true);
		expect(
			result.includes(pullRequest.members_req_changes[0].Slack_Name),
		).equal(true);
		expect(result.includes(pullRequest.leads_req_changes[0].Slack_Name)).equal(
			true,
		);
	});

	it("should consturt a queue string with only members requesting changes", () => {
		const options: any = {
			Queue_Include_Req_Changes_Names: true,
		};
		pullRequest.leads_req_changes = [];

		const result = constructQueueString(pullRequest, options);

		expect(result.includes("Leads Request Changes")).equal(false);
		expect(result.includes("Members Request Changes")).equal(true);
		expect(
			result.includes(pullRequest.members_req_changes[0].Slack_Name),
		).equal(true);
	});

	it("should construct a queue string with only leads requesting changes", () => {
		const options: any = {
			Queue_Include_Req_Changes_Names: true,
		};
		pullRequest.members_req_changes = [];

		const result = constructQueueString(pullRequest, options);

		expect(result.includes("Leads Request Changes")).equal(true);
		expect(result.includes("Members Request Changes")).equal(false);
		expect(result.includes(pullRequest.leads_req_changes[0].Slack_Name)).equal(
			true,
		);
	});

	it("should construct a queue string with neither leads or members requesting changes", () => {
		const options: any = {
			Queue_Include_Req_Changes_Names: true,
		};
		pullRequest.members_req_changes = [];
		pullRequest.leads_req_changes = [];

		const result = constructQueueString(pullRequest, options);

		expect(result.includes("Leads Request Changes")).equal(false);
		expect(result.includes("Members Request Changes")).equal(false);
	});
});
