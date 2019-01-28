import "mocha";
import { constructReqChangesDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructReqChangesDesc", () => {
  it("should construct a valid description", () => {
    const slackUser = "EthanPainter";
    const slackUserRequesting = "dsykes";

    const result = constructReqChangesDesc(slackUser, slackUserRequesting);
    const expected = `${slackUserRequesting} requested changes to ` +
      `this PR. Owner: @${slackUser}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No Slack User provided", () => {
    const slackUser = "";
    const slackUserRequesting = "dsykes";

    const expected = new Error("No slackUser provided");

    expect(() => constructReqChangesDesc(slackUser, slackUserRequesting))
      .to.throw(expected.message);
  });
  it("should throw an error -- No Slack User Requesting changes provided", () => {
    const slackUser = "EthanPainter";
    const slackUserRequesting = "";

    const expected = new Error("No slackUserRequesting provided");

    expect(() => constructReqChangesDesc(slackUser, slackUserRequesting))
      .to.throw(expected.message);
  });
});
