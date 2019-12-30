import { DynamoFilter } from "../../../../src/dynamo/filter/dynamo-filter";
import { assert } from "chai";

describe("checkMessageIds", () => {
	const dynamoFilter = new DynamoFilter();

	it("should find a message id in the list", () => {
		const messageId = "555";
		const messageIds = ["111", "222", "555"];

		const result = dynamoFilter.checkMessageIds(messageIds, messageId);
		const expected = true;

		assert.equal(result, expected);
	});

	it("should not find a message id in the list", () => {
		const messageId = "555";
		const messageIds = ["111", "222", "333"];

		const result = dynamoFilter.checkMessageIds(messageIds, messageId);
		const expected = false;

		assert.equal(result, expected);
	});

	it("should not find a message id in the list when the list is empty", () => {
		const messageId = "555";
		const messageIds: string[] = [];

		const result = dynamoFilter.checkMessageIds(messageIds, messageId);
		const expected = false;

		assert.equal(result, expected);
	});
});
