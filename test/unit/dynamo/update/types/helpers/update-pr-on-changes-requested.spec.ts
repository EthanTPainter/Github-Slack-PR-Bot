import { assert } from "chai";

import { updatePrOnChangesRequested } from "../../../../../../src/dynamo/update/types/helpers";
import { SlackUser } from "../../../../../../src/models";

describe("updatePrOnChangesRequested", () => {
	const json = {
		Departments: {
			Devs: {
				DevTeam1: {
					Options: {
						Num_Required_Lead_Approvals: 1,
						Num_Required_Member_Approvals: 1,
						Member_Before_Lead: true,
					},
					Slack_Group: {
						Slack_Name: "SlackGroupName",
						Slack_Id: "<SlackGroupId>",
					},
					Users: {
						Leads: {
							GitHubLead1: {
								Slack_Name: "SlackLeadName1",
								Slack_Id: "<SlackLeadId1>",
							},
							GitHubLead2: {
								Slack_Name: "SlackLeadName2",
								Slack_Id: "<SlackLeadId2>",
							},
							GitHubLead3: {
								Slack_Name: "SlackLeadName3",
								Slack_Id: "<SlackLeadId3>",
							},
							GitHubLead4: {
								Slack_Name: "SlackLeadName4",
								Slack_Id: "<SlackLeadId4>",
							},
						},
						Members: {
							GitHubMember1: {
								Slack_Name: "SlackMemberName1",
								Slack_Id: "<SlackMemberId1>",
							},
							GitHubMember2: {
								Slack_Name: "SlackMemberName2",
								Slack_Id: "<SlackMemberId2>",
							},
							GitHubMember3: {
								Slack_Name: "SlackMemberName3",
								Slack_Id: "<SlackMemberId3>",
							},
							GitHubMember4: {
								Slack_Name: "SlackMemberName4",
								Slack_Id: "<SlackMemberId4>",
							},
						},
					},
				},
			},
		},
	};

	// Member requesting changes (1 required approval)
	describe("Member requesting changes from standard member alerts (1 required member approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Members req changes should only have one member", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersReqChanges);
		});
		it("Req changes members alert should be empty", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const reqChangesMembersAlert: SlackUser[] = [];

			assert.deepEqual(
				result.pr.req_changes_members_alert,
				reqChangesMembersAlert,
			);
		});
		it("Standard members alert should have the pr owner", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMemberAlerts = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMemberAlerts);
		});
		it("Leftover members should have all members the pr owner", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leftoverMembers = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
		it("New event should be present in the PR", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Member requesting changes from members req changes (1 required member approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Members req changes should only have one member", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersReqChanges);
		});
		it("Standard member alerts should be empty", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMemberAlerts = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMemberAlerts);
		});
		it("Leftover members should contain all members except member requesting changes and pr owner", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leftoverMembers = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
		it("New event should be in the events", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Member requesting changes from req changes members alert (1 required member approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				req_changes_leads_alert: [],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Members req changes should only have one member", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersReqChanges);
		});
		it("Standard member alerts should only have the pr owner", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMemberAlerts = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMemberAlerts);
		});
		it("Leftover members should contain all other members", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leftoverMembers = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
		it("New event should be in the events", () => {
			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});

	// Member requesting changes (2 required approvals)
	describe("Member requesting changes from standard member alerts (2 required member approvals)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_members_alert: [],
				req_changes_leads_alert: [],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Members req changes should only include one member", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersReqChanges);
		});
		it("Standard members alert should include all members except one requesting changes", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMembersAlert = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMembersAlert);
		});
		it("Leftover members should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leftoverMembers: SlackUser[] = [];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
		it("New event should be appended to events", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Member requesting changes from members req changes (2 required member approvals)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				req_changes_members_alert: [],
				req_changes_leads_alert: [],
				events: [],
			};
		});

		it("Member complete is false", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Member req changes should only include one member", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersRquestingChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersRquestingChanges);
		});
		it("Standard members alert should include all members except one requesting changes", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMembersAlert = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMembersAlert);
		});
		it("Leftover members should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.leftoverMembers, []);
		});
		it("New event should be appened to events", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Member requesting changes from req changes members alert (2 required member approvals)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
		};

		beforeEach(() => {
			pr = {
				lead_complete: false,
				member_complete: false,
				leads_approving: [],
				members_approving: [],
				standard_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				],
				standard_leads_alert: [],
				leads_req_changes: [],
				members_req_changes: [],
				req_changes_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				req_changes_leads_alert: [],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.member_complete, false);
		});
		it("Members req changes should only include one member", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_req_changes, membersReqChanges);
		});
		it("Req changes members alert should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.req_changes_members_alert, []);
		});
		it("Standard members alert should be all members except the user requesting changes", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersReqChanges = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.pr.standard_members_alert, membersReqChanges);
		});
		it("Leftover members should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.leftoverMembers, []);
		});
		it("New event should be appended to events", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnChangesRequested(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});

	// Lead requesting changes (1 required approval)
	describe("Lead requesting changes while member before lead is true (1 required lead approval)", () => {});
	describe("Lead requesting changes from standard lead alerts (1 required lead approval)", () => {});
	describe("Lead requesting changes from leads req changes (1 required lead approval)", () => {});
	describe("Lead requesting changes from req changes leads alert (1 required lead approval)", () => {});

	// Lead requesting changes (2 required approval)
	describe("Lead requesting changes while member before lead is true (1 required lead approval)", () => {});
	describe("Lead requesting changes from standard lead alerts (1 required lead approval)", () => {});
	describe("Lead requesting changes from leads req changes (1 required lead approval)", () => {});
	describe("Lead requesting changes from req changes leads alert (1 required lead approval)", () => {});
});
