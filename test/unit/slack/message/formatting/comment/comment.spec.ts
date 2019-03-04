import { expect } from "chai";
import {
  constructCommentDesc,
} from "../../../../../../src/slack/message/construct/description";

describe("constructCommentDesc", () => {

  it("should construct a valid description with different owner & sender", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const commentingUser = {
      Slack_Name: "dsykes",
      Slack_Id: "<@2222>",
    };

    const result = constructCommentDesc(slackUser, commentingUser);
    const expected = `${commentingUser.Slack_Name} has commented on this PR. ` +
      `Owner: ${slackUser.Slack_Id}`;

    expect(result).equal(expected);
  });

  it("should construct a valid description with same owner & sender", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const commentingUser = slackUser;

    const result = constructCommentDesc(slackUser, commentingUser);
    const expected = `${slackUser.Slack_Name} has commented on this PR`;

    expect(result).equal(expected);
  });

  it("should throw an error -- No slackUser provided", () => {
    const slackUser: any = {};
    const commentingUser = {
      Slack_Name: "dsykes",
      Slack_Id: "<@1111>",
    };

    const expected = new Error("slackUser properties undefined");

    expect(() => constructCommentDesc(slackUser, commentingUser))
      .to.throw(expected.message);
  });

  it("should throw an error -- No commentingUser provided", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const commentingUser: any = {};

    const expected = new Error("commentingUser properties undefined");

    expect(() => constructCommentDesc(slackUser, commentingUser))
      .to.throw(expected.message);
  });
});
