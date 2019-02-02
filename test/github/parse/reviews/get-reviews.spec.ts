import { expect } from "chai";
import {
  getApprovingReviews,
  getReqChangesReviews,
} from "../../../../src/github/parse/reviews";

describe("getApprovingReviews", () => {
  it("should filter approving reviews from submitted reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
      Greek8eos: "CHANGES_REQUESTED",
    };

    const result = getApprovingReviews(reviews);
    const expected = ["DillonSykes"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get all users", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "APPROVED",
      Greek8eos: "APPROVED",
    };

    const result = getApprovingReviews(reviews);
    const expected = ["DillonSykes", "EthanTPainter", "Greek8eos"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get an empty array when no reviews provided", () => {
    const reviews = { None: "No Reviews" };

    const result = getApprovingReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get empty array with no approving reviews", () => {
    const reviews = {
      DillonSykes: "COMMENTED",
      EthanTPainter: "REQUESTED_CHANGES",
      Greek8eos: "COMMENTED",
    };

    const result = getApprovingReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getReqChangesReviews", () => {

  it("should filter \"requested changes\" reviews from submitted reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
      Greek8eos: "CHANGES_REQUESTED",
      DanielLarner: "CHANGES_REQUESTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected = ["Greek8eos", "DanielLarner"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get all users", () => {
    const reviews = {
      DillonSykes: "CHANGES_REQUESTED",
      EthanTPainter: "CHANGES_REQUESTED",
      Greek8eos: "CHANGES_REQUESTED",
      DanielLarner: "CHANGES_REQUESTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected = ["DillonSykes", "EthanTPainter", "Greek8eos", "DanielLarner"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get an empty array with no requested changes reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get empty array with no requested changes reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
      Greek8eos: "APPROVED",
      DanielLarner: "COMMENTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });
});
