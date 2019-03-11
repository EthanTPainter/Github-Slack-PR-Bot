import { expect } from "chai";
import { constructOpen } from "../../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../../src/json/parse";
import { OpenedPR } from "../../../../../../src/models";

describe("constructOpen", () => {
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
      Team1: {
        TeamGroup1: {
          Options: {
            Num_Required_Member_Approvals: 1,
            Num_Required_Lead_Approvals: 1,
          },
          Slack_Group: {
            Slack_Name: "Group_Slack_Name",
            Slack_Id: "<@44444>",
          },
          Users: {
            Leads: {
              andrew: {
                Slack_Name: "andrew.C",
                Slack_Id: "<@12345>",
              },
            },
            Members: {
              EthanTPainter: {
                Slack_Name: "ethan.P",
                Slack_Id: "<@123456>",
              },
              dillon: {
                Slack_Name: "dillon.S",
                Slack_Id: "<@1234567>",
              },
            },
          },
        },
      },
    },
  };
  it("should construct an openedPR object", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const newPR = true;

    const result: OpenedPR = constructOpen(validEvent, validJSON, newPR);

    expect((result.description).includes(slackOwner.Slack_Name)).equal(true);
    expect((result.description).includes("opened this PR")).equal(true);
    expect(result.title).equal(validEvent.pull_request.title);
    expect(result.url).equal(validEvent.pull_request.html_url);
    expect(result.owner).equal(validEvent.pull_request.user.login);
  });
});
