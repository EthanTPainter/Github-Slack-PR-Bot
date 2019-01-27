import "mocha";
import { constructOpenDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructOpenDesc", () => {

  it("should construct a valid description with slackGroup", () => {
    const slackUser = "EthanPainter";
    const slackGroup = "minks";
    const newPR = true;

    const result = constructOpenDesc(slackUser, slackGroup, newPR);
    const expected = `${slackUser} opened this PR. Needs *peer* ` +
      `and *lead* reviews @${slackGroup}`;

    expect(result).to.be.equal(expected);
  });

  it("should construct a valid description without slackGroup", () => {
    const slackUser = "EthanPainter";
    const slackGroup = "";
    const newPR = true;

    const result = constructOpenDesc(slackUser, slackGroup, newPR);
    const expected = `${slackUser} opened this PR. Needs *peer* ` +
      `and *lead* reviews`;

    expect(result).to.be.equal(expected);
  });

  it("should contruct a valid dsecription with slackGroup and reopened PR", () => {
    const slackUser = "EthanPainter";
    const slackGroup = "minks";
    const newPR = false;

    const result = constructOpenDesc(slackUser, slackGroup, newPR);
    const expected = `${slackUser} reopened this PR. Needs *peer* ` +
      `and *lead* reviews @${slackGroup}`;

    expect(result).to.be.equal(expected);
  });

  it("should construct a valid description without slackGroup and reopened PR", () => {
    const slackUser = "EthanPainter";
    const slackGroup = "";
    const newPR = false;

    const result = constructOpenDesc(slackUser, slackGroup, newPR);
    const expected = `${slackUser} reopened this PR. Needs *peer* ` +
      `and *lead* reviews`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No Slack user provided", () => {
    const slackUser = "";
    const slackGroup = "";
    const newPR = true;

    const expected = new Error("No slackUser provided");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR))
      .to.throw(expected.message);
  });
});
