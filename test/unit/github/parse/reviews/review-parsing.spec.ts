import { expect } from "chai";
import { Review } from "../../../../../src/models";
import { getLatestReviews } from "../../../../../src/github/parse";

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

    const result = getLatestReviews(reviewList);
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

    const result = getLatestReviews(reviewList);
    const expected = { EthanTPainter: "APPROVED" };

    expect(result).deep.equal(expected);
  });

  it("should not retrieve any reviews", () => {
    const reviewList: Review[] = [];

    const result = getLatestReviews(reviewList);
    const expected = { None: "No Reviews" };

    expect(result).deep.equal(expected);
  });
});
