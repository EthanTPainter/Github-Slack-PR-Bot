import { expect } from "chai";
import { GitHubReview } from "../../../../../src/models";
import { parseLatestReviews } from "../../../../../src/github/parse";

describe("getLatestReviews", () => {
  it("should retrieve most recent reviews from unique users", () => {
    // first.. EthanTPainter -> Commented
    // then... DillonSykes -> Approved
    // then... Greek8eos -> Requested changes
    const reviewList = [
      {
        user: {
          login: "EthanTPainter",
        },
        state: "COMMENTED",
      },
      {
        user: {
          login: "DillonSykes",
        },
        state: "APPROVED",
      },
      {
        user: {
          login: "Greek8eos",
        },
        state: "CHANGES_REQUESTED",
      },
    ];

    const result = parseLatestReviews(reviewList);
    const expected = {
      Greek8eos: "CHANGES_REQUESTED",
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
    };

    expect(result).deep.equal(expected);
  });

  it("should retrieve only latest review from one reviewer", () => {
    // first.. EthanTPainter -> Requested changes
    // then... EthanTPainter -> Commented
    // then... EthanTPainter -> Approved
    const reviewList = [
      {
        user: {
          login: "EthanTPainter",
        },
        state: "CHANGES_REQUESTED",
      },
      {
        user: {
          login: "EthanTPainter",
        },
        state: "COMMENTED",
      },
      {
        user: {
          login: "EthanTPainter",
        },
        state: "APPROVED",
      },
    ];

    const result = parseLatestReviews(reviewList);
    const expected = { EthanTPainter: "APPROVED" };

    expect(result).deep.equal(expected);
  });

  it("should not retrieve any reviews", () => {
    const reviewList: GitHubReview[] = [];

    const result = parseLatestReviews(reviewList);
    const expected = {};

    console.log(`Result: ${JSON.stringify(result)}`);
    expect(Object.keys(result).length).equal(0);
    expect(result).deep.equal(expected);
  });
});
