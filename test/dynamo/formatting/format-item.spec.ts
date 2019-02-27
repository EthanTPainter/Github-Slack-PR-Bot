import { expect } from "chai";
import { formatItem } from "../../../src/dynamo/formatting";

describe.only("formatItem", () => {

  it("should format an item with ", () => {
    const slackUser = { Slack_Name: "EthanPainter", Slack_Id: "<@3018485>" };
    const event = {
      pull_request: {
        title: "NEW BRANCH NEW FEATURE",
        html_url: "www.google.com",
      },
    };
    const json = {
      Departments: {
        D: {
          Ds: {
            Options: {
              Num_Required_Member_Approvals: 2,
              Num_Required_Lead_Approvals: 2,
            },
            Users: {
              Leads: {
                Ethan: {
                  Slack_Name: "EthanPainter",
                  Slack_Id: "<@3018485>",
                },
                Andrew: {
                  Slack_Name: "AndrewC",
                  Slack_Id: "<@1111>",
                },
              },
              Members: {
                Dillon: {
                  Slack_Name: "DillonS",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
        },
      },
    };

    const result = formatItem(slackUser, event, json);
    const expected = {
      owner: slackUser,
      title: event.pull_request.title,
      url: event.pull_request.html_url,
      leads_alert: ["<@1111>"],
      members_alert: ["<@2222>"],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [],
        times: [],
      },
    };

    expect(result).deep.equal(expected);
  });

});
