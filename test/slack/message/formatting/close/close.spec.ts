import { constructCloseDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructCloseDesc", () => {

  it("should construct a valid description with different owner and sender", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@12345>",
    };
    const slackUserClosing = {
      Slack_Name: "dsykes",
      Slack_Id: "<@23456>",
    };

    const result = constructCloseDesc(slackUser, slackUserClosing);
    const expected = `${slackUserClosing.Slack_Name} closed this PR. `
      + `Owner: ${slackUser.Slack_Id}`;

    expect(result).to.be.equal(expected);
  });

  it("should construct a valid description with same owner & sender", () => {
    const slackUser = {
      Slack_Name: "EthanTPainter",
      Slack_Id: "<@1234>",
    };
    const slackUserClosing = slackUser;

    const result = constructCloseDesc(slackUser, slackUserClosing);
    const expected = `${slackUser.Slack_Name} closed this PR.`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- slackUser.Slack_Name undefined", () => {
    const slackUser: any = {};
    const slackUserClosing = {
      Slack_Name: "EthanTPainter",
      Slack_Id: "<@1234>",
    };

    const expected = new Error("slackUser.Slack_Name is undefined");

    expect(() => constructCloseDesc(slackUser, slackUserClosing))
      .to.throw(expected.message);
  });

  it("should throw an error -- No slackUserCommenting provided", () => {
    const slackUser = {
      Slack_Name: "EthanTPainter",
      Slack_Id: "<@1234>",
    };
    const slackUserClosing: any = {};

    const expected = new Error("slackUserClosing.Slack_Name is undefined");

    expect(() => constructCloseDesc(slackUser, slackUserClosing))
      .to.throw(expected.message);
  });
});
