import { constructOpenDesc } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructOpenDesc", () => {

  const validJSON = {
    Options: {
      Num_Required_Lead_Approvals: 1,
      Num_Required_Peer_Approvals: 1,
    },
  };

  it("should construct a valid description with a new PR", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
    const newPR = true;

    const result = constructOpenDesc(slackUser, slackGroup, newPR, validJSON);
    const expected = `${slackUser.Slack_Name} opened this PR. Needs `
      + `*${validJSON.Options.Num_Required_Peer_Approvals} peer* `
      + `and *${validJSON.Options.Num_Required_Lead_Approvals} lead* `
      + `reviews ${slackGroup.Slack_Id}`;

    expect(result).to.be.equal(expected);
  });

  it("should contruct a valid description with a reopened PR", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
    const newPR = false;

    const result = constructOpenDesc(slackUser, slackGroup, newPR, validJSON);
    const expected = `${slackUser.Slack_Name} reopened this PR. Needs `
      + `*${validJSON.Options.Num_Required_Peer_Approvals} peer* `
      + `and *${validJSON.Options.Num_Required_Lead_Approvals} lead* `
      + `reviews ${slackGroup.Slack_Id}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- JSON undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@1221>" };
    const newPR = true;
    const invalidJSON = undefined;

    const expected = new Error("JSON file is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- Options undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@11111>" };
    const newPR = true;
    const invalidJSON = {};

    const expected = new Error("json.Options is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- Num_Required_Lead_Approvals undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@1>" };
    const newPR = true;
    const invalidJSON = {
      Options: {},
    };

    const expected = new Error("json.Options.Num_Required_Lead_Approvals is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- Num_Required_Peer_Approvals undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@UUID1234>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@123>" };
    const newPR = true;
    const invalidJSON = {
      Options: {
        Num_Required_Lead_Approvals: 1,
      },
    };

    const expected = new Error("json.Options.Num_Required_Peer_Approvals is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Slack user provided", () => {
    const slackUser: any = {};
    const slackGroup = { Slack_Name: "TeamName", Slack_Id: "<@123>" };
    const newPR = true;

    const expected = new Error("Slack_Name property not defined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, validJSON))
      .to.throw(expected.message);
  });
});
