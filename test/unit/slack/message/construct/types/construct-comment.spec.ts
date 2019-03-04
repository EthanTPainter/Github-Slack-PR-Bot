import { expect } from "chai";
import { constructComment } from "../../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../../src/json/parse";
import { CommentPR } from "../../../../../../src/models";

describe("constructComment", () => {

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

  it("should construct a CommentPR object with different send & owner", () => {

    const validEvent = {
      action: "submitted",
      pull_request: {
        base: {
          ref: "dev",
        },
        head: {
          ref: "feature-123",
        },
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

    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackCommenter = getSlackUser(validEvent.sender.login, validJSON);

    const result: CommentPR = constructComment(validEvent, validJSON);

    expect((result.description).includes(slackOwner.Slack_Id)).equal(true);
    expect((result.description).includes(slackCommenter.Slack_Name)).equal(true);
    expect((result.description).includes("commented on this PR")).equal(true);
    expect(result.title).equal(validEvent.pull_request.title);
    expect(result.url).equal(validEvent.pull_request.html_url);
    expect(result.owner).equal(validEvent.pull_request.user.login);
    expect(result.user_commenting).equal(validEvent.sender.login);
  });

  it("should construct a CommentPR object with same sender & owner", () => {
    const validEvent = {
      action: "submitted",
      pull_request: {
        base: {
          ref: "dev",
        },
        head: {
          ref: "feature-123",
        },
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

    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackCommenter = getSlackUser(validEvent.sender.login, validJSON);

    const result: CommentPR = constructComment(validEvent, validJSON);

    expect(slackOwner.Slack_Name).equal(slackCommenter.Slack_Name);
    expect(slackOwner.Slack_Id).equal(slackCommenter.Slack_Id);

    expect((result.description).includes(slackOwner.Slack_Name)).equal(true);
    expect((result.description).includes("commented on this PR")).equal(true);
    expect(result.title).equal(validEvent.pull_request.title);
    expect(result.url).equal(validEvent.pull_request.html_url);
    expect(result.owner).equal(validEvent.pull_request.user.login);
    expect(result.user_commenting).equal(validEvent.sender.login);
  });

});
