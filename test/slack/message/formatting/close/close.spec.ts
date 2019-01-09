import "mocha";
import { constructCloseDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructCloseDesc", () => {

  it("should construct a valid description with different owner and sender", () => {
    const slackUser = "EthanPainter";
    const slackUserClosing = "dsykes";

    const result = constructCloseDesc(slackUser, slackUserClosing);
    const expected = `${slackUserClosing} closed this PR. Owner: @${slackUser}`;

    expect(result).to.be.equal(expected);
  });

  it("should construct a valid description with same owner & sender", () => {
    const slackUser = "EthanTPainter";
    const slackUserClosing = "EthanTPainter";

    const result = constructCloseDesc(slackUser, slackUserClosing);
    const expected = `${slackUserClosing} closed this PR.`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No slackUser provided", () => {
    const slackUser = "";
    const slackUserClosing = "dsykes";

    const expected = new Error("No slackUser provided");

    expect(() => constructCloseDesc(slackUser, slackUserClosing))
      .to.throw(expected.message);
  });

  it("should throw an error -- No slackUserCommenting provided", () => {
    const slackUser = "EthanPainter";
    const slackUserClosing = "";

    const expected = new Error("No slackUserClosing provided");

    expect(() => constructCloseDesc(slackUser, slackUserClosing))
      .to.throw(expected.message);
  });
});
