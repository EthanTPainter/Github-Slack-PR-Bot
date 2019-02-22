import {
  constructMergeDesc,
} from "../../../../../src/slack/message/construct/description";

import { expect } from "chai";
import { SlackUser } from "../../../../../src/models";

describe("constructMergeDesc", () => {

  let slackUser: SlackUser;
  let slackUserMerging: SlackUser;
  let branchWithPR: string;
  let branchMergedTo: string;

  beforeEach(() => {
    slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    },
    slackUserMerging = {
      Slack_Name: "acurcie",
      Slack_Id: "<@2222>",
    };
    branchWithPR = "FEATURE-ABC";
    branchMergedTo = "master";
  });

  it("should construct a valid description", () => {

    const result = constructMergeDesc(slackUser, slackUserMerging,
      branchWithPR, branchMergedTo);

    const expected = `${slackUserMerging.Slack_Name} merged this PR ` +
      `from ${branchWithPR} to ${branchMergedTo}. Owner: ${slackUser.Slack_Id}`;

    expect(result).equal(expected);
  });

  it("should throw an error -- SlackUser undefined", () => {
    const invalidSlackUser: any = {};

    const expected = new Error("slackUser properties undefined");

    expect(() => constructMergeDesc(invalidSlackUser, slackUserMerging,
      branchWithPR, branchMergedTo)).to.throw(expected.message);
  });

  it("should throw an error -- slackUserMerging undefined", () => {
    const invalidSlackUserMerging: any = {};

    const expected = new Error("slackUserMerging properties undefined");

    expect(() => constructMergeDesc(slackUser, invalidSlackUserMerging,
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
