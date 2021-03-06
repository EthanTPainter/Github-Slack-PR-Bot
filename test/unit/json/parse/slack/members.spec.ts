import { expect } from "chai";
import { getSlackMembers } from "../../../../../src/json/parse";

describe("getSlackMembers", () => {
	const validJSON = {
		Departments: {
			Developers: {
				PhillyDevTeam: {
					Options: {
						Avoid_Comment_Alerts: 5,
						Check_Mark_Text: ":heavy_check_mark:",
						X_Mark_Text: ":X:",
						Queue_Include_Created_Time: true,
						Queue_Include_Updated_Time: true,
						Queue_Include_Approval_Names: true,
						Queue_Include_Req_Changes_Names: true,
						Queue_Include_Owner: true,
						Queue_Include_New_Line: false,
						Num_Required_Lead_Approvals: 1,
						Num_Required_Member_Approvals: 1,
						Member_Before_Lead: true,
						Disable_GitHub_Alerts: false,
						Require_Fresh_Approvals: false,
						Fresh_Approval_Repositories: [],
					},
					Users: {
						Leads: {},
						Members: {
							ethan: {
								Slack_Name: "ethan.painter",
								Slack_Id: "<@1111>",
							},
							dillon: {
								Slack_Name: "dillon.sykes",
								Slack_Id: "<@2222>",
							},
							daniel: {
								Slack_Name: "daniel.larner",
								Slack_Id: "<@3333>",
							},
						},
					},
				},
			},
		},
	};

	it("should retrieve slack members given a github user", () => {
		const githubUser = "ethan";

		const result = getSlackMembers(githubUser, validJSON);
		const expected = [
			validJSON.Departments.Developers.PhillyDevTeam.Users.Members.ethan,
			validJSON.Departments.Developers.PhillyDevTeam.Users.Members.dillon,
			validJSON.Departments.Developers.PhillyDevTeam.Users.Members.daniel,
		];

		expect(result).deep.equal(expected);
	});

	it("should not retrieve any slack members given a github user", () => {
		const githubUser = "andrew";

		const result = getSlackMembers(githubUser, validJSON);
		const expected: string[] = [];

		expect(result).deep.equal(expected);
	});

	it("should throw an error -- No Team found", () => {
		const invalidJSON = {
			Departments: {},
		};
		const githubUser = "ethan";

		const expected = new Error("No Team found in JSON file");
		expect(() => getSlackMembers(githubUser, invalidJSON)).to.throw(
			expected.message,
		);
	});

	it("should throw an error -- No Team Group", () => {
		const invalidJSON = {
			Departments: {
				NewYork: {},
			},
		};
		const githubUser = "ethan";

		const expected = new Error("No Team Group found in JSON file");
		expect(() => getSlackMembers(githubUser, invalidJSON)).to.throw(
			expected.message,
		);
	});

	it("should throw an error -- No Users", () => {
		const invalidJSON = {
			Departments: {
				NewYork: {
					TeamOne: {},
				},
			},
		};
		const githubUser = "ethan";
		const subTeam = "TeamOne";

		const expected = new Error(`No Users defined for team: ${subTeam}`);
		expect(() => getSlackMembers(githubUser, invalidJSON as any)).to.throw(
			expected.message,
		);
	});

	it("should throw an error -- No Leads", () => {
		const invalidJSON = {
			Departments: {
				NewYork: {
					TeamOne: {
						Users: {},
					},
				},
			},
		};
		const githubUser = "ethan";
		const subTeam = "TeamOne";

		const expected = new Error(`Leads not defined for team: ${subTeam}`);
		expect(() => getSlackMembers(githubUser, invalidJSON as any)).to.throw(
			expected.message,
		);
	});

	it("should throw an error -- No Members", () => {
		const invalidJSON = {
			Departments: {
				NewYork: {
					TeamOne: {
						Users: {
							Leads: {},
						},
					},
				},
			},
		};
		const githubUser = "ethan";
		const subTeam = "TeamOne";

		const expected = new Error(`Members not defined for team: ${subTeam}`);
		expect(() => getSlackMembers(githubUser, invalidJSON as any)).to.throw(
			expected.message,
		);
	});
});
