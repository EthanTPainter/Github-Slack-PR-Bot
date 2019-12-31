import { assert } from "chai";

import { getRepositoryName } from "../../../../../../src/github/parse";

describe("getRepositoryName", () => {
	it("should get the repository name", () => {
		const event = {
			repository: {
				name: "repository-name",
			},
		};

		const result = getRepositoryName(event);
		const expected = event.repository.name;

		assert.equal(result, expected);
	});

	it("should throw an error -- event is undefined", () => {
		const event = undefined;

		try {
			getRepositoryName(event);
			assert.fail();
		} catch (error) {
			assert.instanceOf(error, Error);
			assert.equal(error.message, "event is undefined");
		}
	});

	it("should throw an error -- event.repository undefined", () => {
		const event = {
			repository: undefined,
		};

		try {
			getRepositoryName(event);
			assert.fail();
		} catch (error) {
			assert.instanceOf(error, Error);
			assert.equal(error.message, "event.repository is undefined");
		}
	});

	it("should throw an error -- event.repository.name is undefined", () => {
		const event = {
			repository: {
				name: undefined,
			},
		};

		try {
			getRepositoryName(event);
			assert.fail();
		} catch (error) {
			assert.instanceOf(error, Error);
			assert.equal(error.message, "event.repository.name is undefined");
		}
	});
});
