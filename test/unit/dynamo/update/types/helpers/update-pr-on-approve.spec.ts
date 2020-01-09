import { assert } from "chai";

import { SlackUser } from "../../../../../../src/models";
import { updatePrOnApprove } from "../../../../../../src/dynamo/update/types/helpers";

describe("updatePrOnApprove", () => {
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

	// Members approving (1 required)
	describe("Member from standard member alerts approving (1 required member approval)", () => {
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
				events: [],
			};
		});

		it("New event should be present in the PR", () => {
			const result = updatePrOnApprove(
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
		it("Member complete should be true", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedMemberComplete = true;
			const expectedLeadComplete = false;

			// Member and lead complete are accurate
			assert.equal(result.pr.member_complete, expectedMemberComplete);
			assert.equal(result.pr.lead_complete, expectedLeadComplete);
		});
		it("Members approving should only include the approving user", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedMembersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_approving, expectedMembersApproving);
		});
		it("Standard members alert should be empty", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedStandardMembersAlert: SlackUser[] = [];

			assert.deepEqual(
				result.pr.standard_members_alert,
				expectedStandardMembersAlert,
			);
		});
		it("Slack leads should now be updated", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(
				result.pr.standard_leads_alert.length,
				Object.keys(json.Departments.Devs.DevTeam1.Users.Leads).length,
			);
			assert.deepEqual(result.pr.standard_leads_alert, [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			]);
		});
		it("Leftover members should have remaining members", () => {
			const result = updatePrOnApprove(
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
	});
	describe("Member requesting changes approving (1 required member approval)", () => {
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
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Member complete should be true", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedMemberComplete = true;
			const expectedLeadComplete = false;

			// Member and lead complete are accurate
			assert.equal(result.pr.member_complete, expectedMemberComplete);
			assert.equal(result.pr.lead_complete, expectedLeadComplete);
		});
		it("Members approving should only include the approving user", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedMembersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			// Members approving and standard members alert
			assert.deepEqual(result.pr.members_approving, expectedMembersApproving);
		});
		it("Standard members alert should be empty", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const expectedStandardMembersAlert: SlackUser[] = [];

			assert.deepEqual(
				result.pr.standard_members_alert,
				expectedStandardMembersAlert,
			);
		});
		it("There should be three leftover members -- Two members and pr owner", () => {
			const result = updatePrOnApprove(
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
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
		it("Leftover members should have remaining members", () => {
			const result = updatePrOnApprove(
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
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
			];

			assert.deepEqual(result.leftoverMembers, leftoverMembers);
		});
	});
	describe("Member approving after PR has been fixed by owner (1 required member approval)", () => {
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
				req_changes_leads_alert: [],
				req_changes_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				events: [],
			};
		});

		it("Member commplete should be true", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = true;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Members approving should only include the approver", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_approving, membersApproving);
		});
		it("Req changes members alert should be empty", () => {
			const result = updatePrOnApprove(
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
		it("Standard member alerts should be empty", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMembersAlert: SlackUser[] = [];

			assert.deepEqual(result.pr.standard_members_alert, standardMembersAlert);
		});
		it("Standard lead alerts should have all team leads", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadAlerts = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadAlerts);
		});
		it("New event should be appended", () => {
			const result = updatePrOnApprove(
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

	// Members approving (2 required)
	describe("Member from standard member alerts approving (2 required member approvals)", () => {
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
				events: [],
			};
		});

		it("Member complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
		it("Members approving should only include the approving user", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_approving, membersApproving);
		});
		it("Standard members alert should include other member user(s)", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
			];

			assert.deepEqual(result.pr.standard_members_alert, standardMembersAlert);
		});
		it("New event should be added", () => {
			const result = updatePrOnApprove(
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
	describe("Member requesting changes approving (2 required member approvals)", () => {
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
				members_req_changes: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};

			it("Member complete should be false", () => {
				json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

				const result = updatePrOnApprove(
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
			it("Member approving should only include the approver", () => {
				json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

				const result = updatePrOnApprove(
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
					true,
					json.Departments.Devs.DevTeam1.Options as any,
					pr,
					newEvent,
					json as any,
				);

				const membersApproving = [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				];

				assert.deepEqual(result.pr.members_approving, membersApproving);
			});
			it("Standard member alert should only include other member", () => {
				json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

				const result = updatePrOnApprove(
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
					true,
					json.Departments.Devs.DevTeam1.Options as any,
					pr,
					newEvent,
					json as any,
				);

				const standardMemberAlert = [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
				];

				assert.deepEqual(result.pr.standard_members_alert, standardMemberAlert);
			});
			it("PR Owner should no longer be alerted", () => {
				json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

				const result = updatePrOnApprove(
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
				];

				assert.deepEqual(
					result.pr.standard_members_alert,
					standardMembersAlert,
				);
			});
			it("New event should be appended to events", () => {
				json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

				const result = updatePrOnApprove(
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
	});
	describe("Member approving after PR has been fixed by owner (2 required member approvals)", () => {
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
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				],
				events: [],
			};
		});

		it("Member complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
		it("Req changes members alert should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
		it("Members approving should only one member", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const membersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
			];

			assert.deepEqual(result.pr.members_approving, membersApproving);
		});
		it("Standard members alert should not be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardMembersApproving = [
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3,
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember4,
			];

			assert.deepEqual(
				result.pr.standard_members_alert,
				standardMembersApproving,
			);
		});
		it("New event should be added to events", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
		it("Leftover members should be an empty array", () => {
			json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;

			const result = updatePrOnApprove(
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
	});

	// Leads approving (1 required)
	describe("Lead approving while member before lead (1 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be true", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const memberComplete = false;

			assert.deepEqual(result.pr.member_complete, memberComplete);
		});
		it("Leads approving should only have the approving lead", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Standard leads alert should still be an empty array", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadsAlert: SlackUser[] = [];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadsAlert);
		});
		it("New event should be added to events", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Lead from standard lead alerts approving (1 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be true", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = true;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include one lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Standard lead alerts should still be an empty array", () => {});
		it("New event should be added to events", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Lead requesting changes approving (1 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				standard_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				],
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be true", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = true;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include one lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Standard lead alerting should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadsAlerting: SlackUser[] = [];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadsAlerting);
		});
		it("Leftover leads should include all other leads", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leftoverLeads = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			];

			assert.deepEqual(result.leftoverLeads, leftoverLeads);
		});
		it("New Event should be added to events", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				true,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Lead from req changes leads alert approving (1 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be true", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = true;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include the one lead", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Req Changes leads alert should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const reqChangesLeadAlert: SlackUser[] = [];

			assert.deepEqual(result.pr.req_changes_leads_alert, reqChangesLeadAlert);
		});
		it("New event should be added to events", () => {
			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});

	// Leads approving (2 required)
	describe("Lead approving while member before lead (2 required lead approvals)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = false;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include one lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Standard leads alert should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadsAlert: SlackUser[] = [];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadsAlert);
		});
		it("New event should be appended to events", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Lead from standard lead alerts approving (2 required lead approvals)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				standard_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				],
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete should be false", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = false;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include one lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("standard lead alerts should have all leads except the approving lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadAlert = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadAlert);
		});
		it("New event should be added to events", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
	describe("Lead requesting changes approving (2 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
					json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				],
				standard_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				],
				members_req_changes: [],
				leads_req_changes: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				],
				req_changes_leads_alert: [],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete is false", () => {});
		it("Leads approving should only include one lead", () => {});
		it("Standard leads alert should include all leads except approving lead", () => {});
		it("Leads requesting changes should be empty", () => {});
		it("PR Owner should not be present in standard members alert", () => {});
		it("New event should be appended to events", () => {});
	});
	describe("Lead from req changes leads alert approving (2 required lead approval)", () => {
		let pr: any;

		const newEvent = {
			action: "APPROVED",
			time: "ANY",
			user: json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
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
				standard_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
				],
				members_req_changes: [],
				leads_req_changes: [],
				req_changes_leads_alert: [
					json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				],
				req_changes_members_alert: [],
				events: [],
			};
		});

		it("Lead complete is false", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadComplete = false;

			assert.deepEqual(result.pr.lead_complete, leadComplete);
		});
		it("Leads approving should only include one lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const leadsApproving = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
			];

			assert.deepEqual(result.pr.leads_approving, leadsApproving);
		});
		it("Standard leads alert should include all leads except approving lead", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const standardLeadAlerts = [
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead4,
			];

			assert.deepEqual(result.pr.standard_leads_alert, standardLeadAlerts);
		});
		it("Req changes leads alert should be empty", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			const reqChangesLeadAlerts: SlackUser[] = [];

			assert.deepEqual(result.pr.req_changes_leads_alert, reqChangesLeadAlerts);
		});
		it("New event should be appended to events", () => {
			json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
			json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;

			const result = updatePrOnApprove(
				json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1,
				json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1,
				false,
				json.Departments.Devs.DevTeam1.Options as any,
				pr,
				newEvent,
				json as any,
			);

			assert.deepEqual(result.pr.events[0], newEvent);
		});
	});
});
