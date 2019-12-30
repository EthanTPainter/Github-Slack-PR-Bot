import { expect, assert } from "chai";
import { SlackUser, JSONConfig } from "../../../../../../src/models";
import { constructMemberCheck } from "../../../../../../src/slack/message/construct/checks/member";

describe("constructMemberCheck", () => {
	let validJSON: JSONConfig;

	beforeEach(() => {
		validJSON = {
			Departments: {
				De: {
					D: {
						Options: {
							Check_Mark_Text: ":heavy_check_mark:",
							X_Mark_Text: ":X:",
							Num_Required_Member_Approvals: 0,
							Avoid_Comment_Alerts: 5,
							Queue_Include_Created_Time: true,
							Queue_Include_Updated_Time: true,
							Queue_Include_Approval_Names: true,
							Queue_Include_Req_Changes_Names: true,
							Queue_Include_Owner: true,
							Queue_Include_New_Line: false,
							Num_Required_Lead_Approvals: 1,
							Member_Before_Lead: true,
							Disable_GitHub_Alerts: false,
							Require_Fresh_Approvals: false,
							Fresh_Approval_Repositories: [],
						},
						Users: {
							Leads: {},
							Members: {
								et: {
									Slack_Name: "Ethan",
									Slack_Id: "<@1111>",
								},
								dan: {
									Slack_Name: "Daniel",
									Slack_Id: "<@2222>",
								},
								dil: {
									Slack_Name: "Dillon",
									Slack_Id: "<@3333>",
								},
								Joshua: {
									Slack_Name: "Joshua",
									Slack_Id: "<@4444>",
								},
								Harrison: {
									Slack_Name: "Harrison",
									Slack_Id: "<@5555>",
								},
							},
						},
					},
				},
			},
		};
	});

	it("construct a Member check with 0 required reviews and 1 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 0;
		const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`0 Required Member Approvals: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 0 required reviews, but 1 requesting changes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 0;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges = [validJSON.Departments.De.D.Users.Members.et];
		const membersNotApproving: SlackUser[] = [];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected = `0 Required Member Approvals: ${membersReqChanges[0].Slack_Name} ${options.X_Mark_Text} `;

		assert.equal(result, expected);
	});

	it("construct a Member check with 0 required reviews", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 0;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
			{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected = "";

		expect(result).equal(expected);
	});

	it("construct a Member check with 1 required review and 0 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 1;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`1 Required Member Approval: ${membersNotApproving[0].Slack_Id} ` +
			`${membersNotApproving[1].Slack_Id} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 1 required review and 1 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 1;
		const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`1 Required Member Approval: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 1 required review and 2 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 1;
		const membersApproving = [
			{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
		];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`1 Required Member Approval: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} ` +
			`${membersApproving[1].Slack_Name} ${validJSON.Departments.De.D.Options.Check_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 2 required reviews and 1 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 2;
		const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`2 Required Member Approvals: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} ` +
			`${membersNotApproving[0].Slack_Id} ${membersNotApproving[1].Slack_Id} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 2 required reviews and 2 approving", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 2;
		const membersApproving = [
			{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
		];
		const membersReqChanges: SlackUser[] = [];
		const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`2 Required Member Approvals: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} ` +
			`${membersApproving[1].Slack_Name} ${validJSON.Departments.De.D.Options.Check_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 1 required review, 0 approving, 1 requested changes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 1;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@2222>" }];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`1 Required Member Approval: ${membersReqChanges[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.X_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 2 required reviews, 0 approving, 1 requesting chagnes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 2;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@2222>" }];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`2 Required Member Approvals: ${membersReqChanges[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.X_Mark_Text} ` +
			`${membersNotApproving[0].Slack_Id} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 2 required reviews, 0 approving, 2 requesting changes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 2;
		const membersApproving: SlackUser[] = [];
		const membersReqChanges = [
			{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
			{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
		];
		const membersNotApproving = [
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
			{ Slack_Name: "Joshua", Slack_Id: "<@4444>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`2 Required Member Approvals: ${membersReqChanges[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.X_Mark_Text} ` +
			`${membersReqChanges[1].Slack_Name} ${validJSON.Departments.De.D.Options.X_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 2 required reviews, 1 approving, 1 requesting changes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 2;
		const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersReqChanges = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
		const membersNotApproving = [
			{ Slack_Name: "Dillon", Slack_Id: "<@3333" },
			{ Slack_Name: "Joshua", Slack_Id: "<@4444>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`2 Required Member Approvals: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} ` +
			`${membersReqChanges[0].Slack_Name} ${validJSON.Departments.De.D.Options.X_Mark_Text} `;

		expect(result).equal(expected);
	});

	it("construct a Member check with 3 required reviews, 1 approving, 1 requesting changes", () => {
		validJSON.Departments.De.D.Options.Num_Required_Member_Approvals = 3;
		const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
		const membersReqChanges = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
		const membersNotApproving = [
			{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
			{ Slack_Name: "Joshua", Slack_Id: "<@4444>" },
			{ Slack_Name: "Harrison", Slack_Id: "<@5555>" },
		];
		const options = validJSON.Departments.De.D.Options;

		const result = constructMemberCheck(
			validJSON,
			membersApproving,
			membersReqChanges,
			membersNotApproving,
			options,
		);

		const expected =
			`3 Required Member Approvals: ${membersApproving[0].Slack_Name} ` +
			`${validJSON.Departments.De.D.Options.Check_Mark_Text} ` +
			`${membersReqChanges[0].Slack_Name} ${validJSON.Departments.De.D.Options.X_Mark_Text} ` +
			`${membersNotApproving[0].Slack_Id} ${membersNotApproving[1].Slack_Id} ` +
			`${membersNotApproving[2].Slack_Id} `;

		expect(result).equal(expected);
	});
});
