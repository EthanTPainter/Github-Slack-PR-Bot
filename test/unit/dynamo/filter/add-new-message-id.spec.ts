import { assert } from "chai";
import { DynamoFilter } from "../../../../src/dynamo/filter/dynamo-filter";

describe("addNewMessageId", () => {
	const dynamoFilter = new DynamoFilter();

	it("should add new message to a list with available space", () => {
		const ids = ["1", "2", "3"];
		const id = "4";

		const result = dynamoFilter.addNewMessageId(ids, id);
		const expected = ["1", "2", "3", "4"];

		assert.deepEqual(result, expected);
	});

	it("should add new message to a list while removing the oldest existing message id", () => {
		const ids = [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"15",
			"16",
			"17",
			"18",
			"19",
			"20",
		];
		const id = "21";

		const result = dynamoFilter.addNewMessageId(ids, id);
		const expected = [
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"15",
			"16",
			"17",
			"18",
			"19",
			"20",
			"21",
		];

		assert.deepEqual(result, expected);
	});

	it("should add new message to a list that is empty", () => {
		const ids: string[] = [];
		const id = "1";

		const result = dynamoFilter.addNewMessageId(ids, id);
		const expected = ["1"];

		assert.deepEqual(result, expected);
	});
});
