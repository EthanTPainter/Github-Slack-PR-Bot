import { expect } from "chai";
import { constructOpenDesc } from "../../../../../../src/slack/message/construct/description";
import { JSONConfig } from "../../../../../../src/models";

describe("constructOpenDesc", () => {
	const validJSON: JSONConfig = {
		Departments: {
			Devs: {
				Des: {
					Options: {
						Num_Required_Lead_Approvals: 1,
						Num_Required_Member_Approvals: 1,
						// Below settings have no affect on tests
						Avoid_Comment_Alerts: 10,
						Check_Mark_Text: "ch",
						X_Mark_Text: "X",
						Disable_GitHub_Alerts: false,
						Fresh_Approval_Repositories: [],
						Member_Before_Lead: false,
						Queue_Include_Approval_Names: false,
						Queue_Include_Created_Time: false,
						Queue_Include_New_Line: true,
						Queue_Include_Owner: false,
						Queue_Include_Req_Changes_Names: false,
						Queue_Include_Updated_Time: false,
						Require_Fresh_Approvals: false,
					},
					Slack_Group: {
						Slack_Name: "minks",
						Slack_Id: "<@12345>",
					},
					Users: {
						Leads: {},
						Members: {
							ET: {
								Slack_Name: "EthanPainter",
								Slack_Id: "<@1111>",
							},
						},
					},
				},
			},
		},
	};

	it("should construct a valid description with a new PR", () => {
		const slackUser = {
			Slack_Name: "EthanPainter",
			Slack_Id: "<@1111>",
		};
		const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
		const newPR = true;

		const result = constructOpenDesc(slackUser, slackGroup, newPR, validJSON);
		const expected =
			`${slackUser.Slack_Name} opened this PR. Needs ` +
			`*${validJSON.Departments.Devs.Des.Options.Num_Required_Member_Approvals} member* ` +
			`and *${validJSON.Departments.Devs.Des.Options.Num_Required_Lead_Approvals} lead* ` +
			`reviews ${slackGroup.Slack_Id}`;

		expect(result).equal(expected);
	});

	it("should contruct a valid description with a reopened PR", () => {
		const slackUser = {
			Slack_Name: "EthanPainter",
			Slack_Id: "<@1111>",
		};
		const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
		const newPR = false;

		const result = constructOpenDesc(slackUser, slackGroup, newPR, validJSON);
		const expected =
			`${slackUser.Slack_Name} reopened this PR. Needs ` +
			`*${validJSON.Departments.Devs.Des.Options.Num_Required_Member_Approvals} member* ` +
			`and *${validJSON.Departments.Devs.Des.Options.Num_Required_Lead_Approvals} lead* ` +
			`reviews ${slackGroup.Slack_Id}`;

		expect(result).equal(expected);
	});

	it("should throw an error -- JSON undefined", () => {
		const slackUser = {
			Slack_Name: "EthanPainter",
			Slack_Id: "<@1111>",
		};
		const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
		const newPR = true;
		const invalidJSON = undefined;

		const expected = new Error("JSON is undefined");

		expect(() =>
			constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON as any),
		).to.throw(expected.message);
	});

	it("should throw an error -- Options undefined", () => {
		const slackUser = {
			Slack_Name: "EthanPainter",
			Slack_Id: "<@1111>",
		};
		const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
		const newPR = true;
		const invalidJSON = {};

		const expected = new Error("JSON is undefined");

		expect(() =>
			constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON as any),
		).to.throw(expected.message);
	});
});
