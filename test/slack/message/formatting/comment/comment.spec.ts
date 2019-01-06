import "mocha";
import { constructCommentDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructCommentDesc", () => {

  it("should construct a valid description", () => {
    const slackUser = "EthanPainter";
    const commentingUser = "dsykes";

    const result = constructCommentDesc(slackUser, commentingUser);
    const expected = `${commentingUser} has commented on this PR. ` +
      `Owner: @${slackUser}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No slackUser provided", () => {
    const slackUser = "";
    const commentingUser = "dsykes";

    const expected = new Error("No slackUser provided");

    expect(() => constructCommentDesc(slackUser, commentingUser))
      .to.throw(expected.message);
  });

  it("should throw an error -- No commentingUser provided", () => {
    const slackUser = "EthanPainter";
    const commentingUser = "";

    const expected = new Error("No commentingUser provided");

    expect(() => constructCommentDesc(slackUser, commentingUser))
      .to.throw(expected.message);
  });
});
