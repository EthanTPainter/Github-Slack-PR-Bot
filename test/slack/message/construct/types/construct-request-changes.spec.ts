import { expect } from "chai";
import { constructReqChanges } from "../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../src/json/parse";

describe("constructReqChanges", () => {
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
        TeamGroup1: {
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

  it("should construct a valid request for changes to a PR", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackUserRequest = getSlackUser(validEvent.sender.login, validJSON);

    const result = constructReqChanges(validEvent, validJSON);

    expect((result.description).includes(slackOwner.Slack_Id)).equal(true);
    expect((result.description).includes(slackUserRequest.Slack_Name)).equal(true);
    expect(result.title).equal(validEvent.pull_request.title);
    expect(result.url).equal(validEvent.pull_request.html_url);
    expect(result.owner).equal(validEvent.pull_request.user.login);
    expect(result.user_requesting_changes).equal(validEvent.sender.login);
  });
});
