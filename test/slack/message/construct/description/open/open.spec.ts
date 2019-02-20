import { constructOpenDesc } from "../../../../../../src/slack/message/construct/description";
import { expect } from "chai";

describe("constructOpenDesc", () => {

  const validJSON = {
    Departments: {
      Devs: {
        Des: {
          Options: {
            Num_Required_Lead_Approvals: 1,
            Num_Required_Member_Approvals: 1,
          },
          Slack_Group: {
            Slack_Name: "minks",
            Slack_Id: "<@12345>",
          },
          Users: {
            Leads: {

            },
            Members: {
              ET: {
                Slack_Name: "EthanPainter",
                Slack_Id: "<@1111>",
              },
            },
          },
        },
      },
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
      + `*${validJSON.Departments.Devs.Des.Options.Num_Required_Member_Approvals} Member* `
      + `and *${validJSON.Departments.Devs.Des.Options.Num_Required_Lead_Approvals} lead* `
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
      + `*${validJSON.Departments.Devs.Des.Options.Num_Required_Member_Approvals} Member* `
      + `and *${validJSON.Departments.Devs.Des.Options.Num_Required_Lead_Approvals} lead* `
      + `reviews ${slackGroup.Slack_Id}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- JSON undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
    const newPR = true;
    const invalidJSON = undefined;

    const expected = new Error("JSON is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- Options undefined", () => {
    const slackUser = {
      Slack_Name: "EthanPainter",
      Slack_Id: "<@1111>",
    };
    const slackGroup = { Slack_Name: "minks", Slack_Id: "<@12345>" };
    const newPR = true;
    const invalidJSON = {};

    const expected = new Error("JSON is undefined");

    expect(() => constructOpenDesc(slackUser, slackGroup, newPR, invalidJSON))
      .to.throw(expected.message);
  });

});
