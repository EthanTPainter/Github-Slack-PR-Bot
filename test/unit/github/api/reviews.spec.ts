import { review_result, solo_review } from "./review-result";
import * as sinon from "sinon";
import { expect } from "chai";
import { Review } from "../../../../src/github/api";

describe("getReviews", () => {
	it("should get a list of PR reviews with only one review", async () => {
    const githubToken = "abc123";
		const path =
			"/repos/EthanTPainter/Descriptive-Project-With-Longest-Repository-Name-Allowed/pulls/1/reviews";
		const expected = solo_review;
		const ReviewClass = new Review();

		// Stub out getReviews to return solo_review
		sinon.stub(ReviewClass, "getReviews").resolves(solo_review as any);

		const actual = await ReviewClass.getReviews(githubToken, path);

		expect(actual.length).deep.equal(expected.length);
		expect(actual[0]).deep.equal(expected[0]);
	});

	it("should construct a list of reviews for a PR from a public repo", async () => {
    const githubToken = "abc123";
		const path = "/repos/EthanTPainter/Comparative-Programming/pulls/1/reviews";
		const expected = review_result;
		const ReviewClass = new Review();

		// Stub out getReviews to return review_result
		sinon.stub(ReviewClass, "getReviews").resolves(review_result as any);

		const actual = await ReviewClass.getReviews(githubToken, path);

		expect(actual.length).deep.equal(expected.length);
		expect(actual[0]).deep.equal(expected[0]);
		expect(actual[1]).deep.equal(expected[1]);
		expect(actual[2]).deep.equal(expected[2]);
		expect(actual[3]).deep.equal(expected[3]);
	});
});
