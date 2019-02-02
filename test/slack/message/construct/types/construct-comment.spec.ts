import { expect } from "chai";
import { constructComment } from "../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../src/json/parse";
import { CommentPR } from "../../../../../src/models";

describe("constructComment", () => {
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
              andrew: "andrew.C",
            },
            Members: {
              EthanTPainter: "ethan.P",
              dillon: "dillon.S",
            },
          },
        },
      },
    },
  };
  it("should construct a CommentPR object", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackCommenter = getSlackUser(validEvent.pull_request.user.login, validJSON);

    const result: CommentPR = constructComment(validEvent, validJSON);

    expect((result.description).includes(slackOwner)).to.be.equal(true);
    expect((result.description).includes(slackCommenter)).to.be.equal(true);
    expect((result.description).includes("commented on this PR")).to.be.equal(true);
    expect(result.title).to.be.equal(validEvent.pull_request.title);
    expect(result.url).to.be.equal(validEvent.pull_request.html_url);
    expect(result.owner).to.be.equal(validEvent.pull_request.user.login);
    expect(result.user_commenting).to.be.equal(validEvent.sender.login);
  });
});
