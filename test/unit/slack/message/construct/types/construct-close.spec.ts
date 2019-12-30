import { expect } from "chai";
import { constructClose } from "../../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../../src/json/parse";
import { ClosePR } from "../../../../../../src/models";

describe("constructClose", () => {
  const validEvent = {
    action: "submitted",
    pull_request: {
      title: "feat(123): Adding a new feature",
      url: "https://api.github.com/repos/EthanTPainter/Comparative-Programming/pulls/1",
      html_url: "https://github.com/EthanTPainter/Comparative-Programming/pull/1",
      user: {
        login: "EthanTPainter",
      },
    },
    sender: {
      login: "andrew",
    },
  };
  const validJSON = {
    Departments: {
      Dev: {
        Team1: {
          Options: {
            Avoid_Comment_Alerts: 10,
            Check_Mark_Text: "",
            X_Mark_Text: "",
            Queue_Include_Created_Time: false,
            Queue_Include_Updated_Time: false,
            Queue_Include_Approval_Names: false,
            Queue_Include_Req_Changes_Names: false,
            Queue_Include_Owner: false,
            Queue_Include_New_Line: false,
            Num_Required_Member_Approvals: 0,
            Num_Required_Lead_Approvals: 0,
            Disable_GitHub_Alerts: false,
            Member_Before_Lead: false,
            Require_Fresh_Approvals: false,
					  Fresh_Approval_Repositories: [],
          },
          Users: {
            Leads: {
              andrew: {
                Slack_Name: "andrew.C",
                Slack_Id: "<@1111>",
              },
            },
            Members: {
              EthanTPainter: {
                Slack_Name: "ethan.P",
                Slack_Id: "<@2222>",
              },
              dillon: {
                Slack_Name: "dillon.S",
                Slack_Id: "<@3333>",
              },
            },
          },
        },
      },
    },
  };
  it("should construct a ClosePR object with a different sender & owner", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackCloser = getSlackUser(validEvent.sender.login, validJSON);

    const result: ClosePR = constructClose(validEvent, validJSON);

    expect((result.description).includes(slackOwner.Slack_Id)).equal(true);
    expect((result.description).includes(slackCloser.Slack_Name)).equal(true);
    expect((result.description).includes("closed this PR")).equal(true);
    expect(result.title).equal(validEvent.pull_request.title);
    expect(result.url).equal(validEvent.pull_request.html_url);
    expect(result.owner).equal(validEvent.pull_request.user.login);
    expect(result.user_closing).equal(validEvent.sender.login);
  });

  it("should construct a ClosePR object with the same sender & owner", () => {
    const newEvent = {
      action: "submitted",
      pull_request: {
        title: "feat(123): Adding a new feature",
        url: "https://api.github.com/repos/EthanTPainter/Comparative-Programming/pulls/1",
        html_url: "https://github.com/EthanTPainter/Comparative-Programming/pull/1",
        user: {
          login: "EthanTPainter",
        },
      },
      sender: {
        login: "EthanTPainter",
      },
    };

    const slackOwner = getSlackUser(newEvent.pull_request.user.login, validJSON);
    const slackCloser = getSlackUser(newEvent.sender.login, validJSON);

    const result: ClosePR = constructClose(newEvent, validJSON);

    expect(slackOwner).equal(slackCloser);
    expect((result.description).includes(slackOwner.Slack_Name)).equal(true);
    expect((result.description).includes("closed this PR")).equal(true);
    expect(result.title).equal(newEvent.pull_request.title);
    expect(result.url).equal(newEvent.pull_request.html_url);
    expect(result.user_closing).equal(newEvent.sender.login);
  });
});
