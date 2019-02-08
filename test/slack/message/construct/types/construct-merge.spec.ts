import { expect } from "chai";
import { constructMerge } from "../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../src/json/parse";
import { MergePR, SlackUser } from "../../../../../src/models";

describe("constructMerge", () => {
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
  const validJSON = {
    Teams: {
      Team1: {
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
  it("should construct a mergedPR object with different sender and owner", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackMerger = getSlackUser(validEvent.sender.login, validJSON);

    const result: MergePR = constructMerge(validEvent, validJSON);

    expect((result.description).includes(slackMerger.Slack_Name)).to.be.equal(true);
    expect((result.description).includes("merged this PR")).to.be.equal(true);
    expect((result.description).includes(validEvent.pull_request.head.ref)).to.be.equal(true);
    expect((result.description).includes(validEvent.pull_request.base.ref)).to.be.equal(true);
    expect((result.description).includes(slackOwner.Slack_Id)).to.be.equal(true);
    expect(result.title).to.be.equal(validEvent.pull_request.title);
    expect(result.url).to.be.equal(validEvent.pull_request.html_url);
    expect(result.owner).to.be.equal(validEvent.pull_request.user.login);
    expect(result.user_merging).to.be.equal(validEvent.sender.login);
    expect(result.remote_branch).to.be.equal(validEvent.pull_request.head.ref);
    expect(result.base_branch).to.be.equal(validEvent.pull_request.base.ref);
  });
});
