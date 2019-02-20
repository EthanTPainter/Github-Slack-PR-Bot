import { constructReqChangesDesc } from "../../../../../../src/slack/message/construct/description";
import { expect } from "chai";

describe("constructReqChangesDesc", () => {

  it("should construct a valid description", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackUserRequesting = {
      Slack_Name: "dsykes",
      Slack_Id: "<@2222>",
    };

    const result = constructReqChangesDesc(slackUser, slackUserRequesting);
    const expected = `${slackUserRequesting.Slack_Name} requested changes to ` +
      `this PR. Owner: ${slackUser.Slack_Id}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No Slack User provided", () => {
    const slackUser: any = {};
    const slackUserRequesting = {
      Slack_Name: "dsykes",
      Slack_Id: "<@1111>",
    };

    const expected = new Error("slackUser properties undefined");

    expect(() => constructReqChangesDesc(slackUser, slackUserRequesting))
      .to.throw(expected.message);
  });
  it("should throw an error -- No Slack User Requesting changes provided", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackUserRequesting: any = {};

    const expected = new Error("slackUserRequestingChanges properties undefined");

    expect(() => constructReqChangesDesc(slackUser, slackUserRequesting))
      .to.throw(expected.message);
  });
});
