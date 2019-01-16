import "mocha";
import { expect } from "chai";
import { constructApprove } from "../../../../../src/slack/message/construct";
import { getSlackUser } from "../../../../../src/json/parse";
import { ApprovePR } from "../../../../../src/models";

describe("constructApprove", () => {
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
    repository: {
      private: false,
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
  it("should construct an ApprovePR ojbect", () => {
    const slackOwner = getSlackUser(validEvent.pull_request.user.login, validJSON);
    const slackApprover = getSlackUser(validEvent.sender.login, validJSON);

    // COME BACK AND FINISH UP WHEN CONSTRUCT APPROVE IS FULLY FLESHED OUT
  });
});
