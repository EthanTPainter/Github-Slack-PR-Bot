import { expect } from "chai";
import {
  getReqChangesReviews,
} from "../../../../src/github/parse/reviews";

describe("getReqChangesReviews", () => {
  it("should filter \"requested changes\" reviews from submitted reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
      Greek8eos: "CHANGES_REQUESTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected = ["Greek8eos"];

    expect(result).deep.equal(expected);
  });

  it("should get all users", () => {
    const reviews = {
      DillonSykes: "CHANGES_REQUESTED",
      EthanTPainter: "CHANGES_REQUESTED",
      Greek8eos: "CHANGES_REQUESTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected = ["DillonSykes", "EthanTPainter", "Greek8eos"];

    expect(result).deep.equal(expected);
  });

  it("should get an empty array when no \"changes requested\" reviews are provided", () => {
    const reviews = { None: "No Reviews" };

    const result = getReqChangesReviews(reviews);
    const expected: string[] = [];

    expect(result).deep.equal(expected);
  });

  it("should get empty array with no approving reviews", () => {
    const reviews = {
      DillonSykes: "COMMENTED",
      EthanTPainter: "APPROVED",
      Greek8eos: "COMMENTED",
    };

    const result = getReqChangesReviews(reviews);
    const expected: string[] = [];

    expect(result).deep.equal(expected);
  });

});
