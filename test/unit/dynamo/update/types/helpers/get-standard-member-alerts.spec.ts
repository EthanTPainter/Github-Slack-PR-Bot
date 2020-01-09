import { assert } from "chai";

import { getStandardMemberAlerts } from "../../../../../../src/dynamo/update/types/helpers";

describe("getStandardMemberAlerts", () => {
	// 1 required member approval
	it("Member is approving", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};

		const options = {
			Num_Required_Member_Approvals: 1,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[prChanger, otherMember1, otherMember2],
			[prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Member is requesting changes", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};

		const options = {
			Num_Required_Member_Approvals: 1,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			false,
			[prChanger, otherMember1, otherMember2],
			[],
			[prChanger],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [prOwner]);
	});
	it("Member is approving with an existing approval", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const options = {
			Num_Required_Member_Approvals: 1,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[],
			[otherMember1, prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Member is requesting changes with an existing requested change", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const options = {
			Num_Required_Member_Approvals: 1,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			false,
			[prOwner],
			[],
			[prChanger],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [prOwner]);
	});
	it("Member is approving with an existing approval from another user", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[otherMember2, prChanger],
			[otherMember1, prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Member is requesting changes with existing requested changes from another user", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const options = {
			Num_Required_Member_Approvals: 1,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			false,
			[prOwner],
			[],
			[otherMember1, prChanger],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [prOwner]);
	});

	// 2 required member approvals
	it("Member is approving", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};

		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[prChanger, otherMember1, otherMember2],
			[prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [otherMember1, otherMember2]);
	});
	it("Member is requesting changes", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			false,
			[prChanger, otherMember1, otherMember2],
			[prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [otherMember1, otherMember2, prOwner]);
	});
	it("Member is approving with an existing approval", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[prChanger, otherMember1, otherMember2],
			[prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [otherMember1, otherMember2]);
	});
	it("Member is requesting changes with an existing requested change", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			false,
			[otherMember1, otherMember2, prOwner],
			[],
			[prChanger],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [otherMember1, otherMember2, prOwner]);
	});
	it("Member is approving with an existing approval from another user", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[otherMember2, prChanger],
			[otherMember1, prChanger],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Member is requesting changes with an existing requested change from another user", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};
		const options = {
			Num_Required_Member_Approvals: 2,
		};

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			false,
			true,
			[otherMember2, prChanger],
			[],
			[otherMember1, prChanger],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [prOwner]);
	});

	it("When user changing the PR is a lead, don't change any standard member alerts", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};

		const options = {
			Num_Required_Member_Approvals: 1,
		};
		const standardMemberAlerts = [otherMember1, otherMember2];

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			true,
			false,
			standardMemberAlerts,
			[],
			[],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [otherMember1, otherMember2, prOwner]);
	});
	it("When user approving the PR is a lead, don't change any standard member alerts", () => {
		const prOwner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const prChanger = {
			Slack_Id: "<PrChangerId>",
			Slack_Name: "PR Changer",
		};
		const otherMember1 = {
			Slack_Id: "<OtherMemberId1>",
			Slack_Name: "Other Member 1",
		};
		const otherMember2 = {
			Slack_Id: "<OtherMemberId2>",
			Slack_Name: "Other Member 2",
		};

		const options = {
			Num_Required_Member_Approvals: 1,
		};
		const standardMemberAlerts = [otherMember1, otherMember2];

		const result = getStandardMemberAlerts(
			prOwner,
			false,
			prChanger,
			true,
			true,
			standardMemberAlerts,
			[],
			[],
			[],
			[],
			options as any,
		);

		const expectedMemberAlerts = standardMemberAlerts;
		expectedMemberAlerts.push(prOwner);

		assert.deepEqual(result, expectedMemberAlerts);
	});
});
