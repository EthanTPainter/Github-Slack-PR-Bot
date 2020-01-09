import { assert } from "chai";

import { getStandardLeadAlerts } from "../../../../../../src/dynamo/update/types/helpers";

describe("getStandardLeadAlerts", () => {
	// Member before lead, 1 approval
	it("should match the standard lead alerts when approver is not a lead", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const lead = {
			Slack_Id: "<Lead1>",
			Slack_Name: "Lead 1",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			false,
			true,
			true,
			[lead],
			[],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [lead]);
	});
	it("Lead approving", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Lead requesting changes (should not alert owner)", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			false,
			false,
			[],
			[member],
			[],
			[],
			[changer],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Lead requesting changes (should alert owner)", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			true,
			changer,
			true,
			false,
			false,
			[],
			[member],
			[],
			[],
			[changer],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});

	// Member before lead, 2 approvals
	it("Lead approving", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const lead = {
			Slack_Id: "leadId",
			Slack_Name: "Lead Name",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 2,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[lead],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});

	// No member before lead, 2 approvals
	it("Lead approving", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const lead = {
			Slack_Id: "<LeadId>",
			Slack_Name: "Lead",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: false,
			Num_Required_Lead_Approvals: 2,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[lead],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, [lead]);
	});

	// Edge cases
	it("Should be empty when no required lead approvals", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 0,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Should be empty when member before lead is true but not member complete", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Should be empty when fully lead approved and no leads are alerted for changes", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member = {
			Slack_Id: "<Member>",
			Slack_Name: "Member",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			false,
			[],
			[member],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
	it("Should be empty when member before lead is true and member complete, but members still alerted", () => {
		const owner = {
			Slack_Id: "<OwnerId>",
			Slack_Name: "Owner",
		};
		const changer = {
			Slack_Id: "<ChangerId>",
			Slack_Name: "Changer",
		};
		const member1 = {
			Slack_Id: "<Member1>",
			Slack_Name: "Member 1",
		};
		const options = {
			Member_Before_Lead: true,
			Num_Required_Lead_Approvals: 1,
		};

		const result = getStandardLeadAlerts(
			owner,
			false,
			changer,
			true,
			true,
			true,
			[],
			[member1],
			[],
			[changer],
			[],
			[],
			options as any,
		);

		assert.deepEqual(result, []);
	});
});
