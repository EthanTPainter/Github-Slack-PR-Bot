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

  it("should construct a valid request for changes to a PR", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackUserRequest = getSlackUser(validEvent.sender.login, validJSON);

    const result = constructReqChanges(validEvent, validJSON);

    expect((result.description).includes(slackOwner)).to.be.equal(true);
    expect((result.description).includes(slackUserRequest)).to.be.equal(true);
    expect(result.title).to.be.equal(validEvent.pull_request.title);
    expect(result.url).to.be.equal(validEvent.pull_request.html_url);
    expect(result.owner).to.be.equal(validEvent.pull_request.user.login);
    expect(result.user_requesting_changes).to.be.equal(validEvent.sender.login);
  });
});
