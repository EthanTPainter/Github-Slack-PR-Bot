import "mocha";
import { constructMergeDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructMergeDesc", () => {

  let slackUser = "EthanPainter";
  let slackUserMerging = "acurcie";
  let branchWithPR = "FEATURE-ABC";
  let branchMergedTo = "master";

  beforeEach(() => {
    slackUser = "EthanPainter";
    slackUserMerging = "acurcie";
    branchWithPR = "FEATURE-ABC";
    branchMergedTo = "master";
  });

  it("should construct a valid description", () => {

    const result = constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo);

    const expected = `${slackUserMerging} merged this PR ` +
      `from ${branchWithPR} to ${branchMergedTo}. Owner: @${slackUser}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No Slack User provided", () => {
    slackUser = "";

    const expected = new Error("No slackUser provided");

    expect(() => constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo)).to.throw(expected.message);
  });

  it("should throw an error -- No slackUserMerging provided", () => {
    slackUserMerging = "";

    const expected = new Error("No slackUserMerging provided");

    expect(() => constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo)).to.throw(expected.message);
  });

  it("should throw an error -- No branchWithPR provided", () => {
    branchWithPR = "";

    const expected = new Error("No branchWithPR provided");

    expect(() => constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo)).to.throw(expected.message);
  });

  it("should throw an error -- No branchMergedTo provided", () => {
    branchMergedTo = "";

    const expected = new Error("No branchMergedTo provided");

    expect(() => constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo)).to.throw(expected.message);
  });
});
