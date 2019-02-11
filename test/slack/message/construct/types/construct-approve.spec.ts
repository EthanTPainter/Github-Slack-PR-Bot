import { expect } from "chai";
import * as sinon from "sinon";
import { constructApprove } from "../../../../../src/slack/message/construct";
import { Review } from "../../../../../src/github/api";

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
      login: "gwely",
    },
    repository: {
      private: false,
    },
  };

  const validJSON = {
    Options: {
      Num_Required_Peer_Approvals: 2,
      Num_Required_Lead_Approvals: 2,
      Check_Mark_Style: "green",
      X_Mark_Style: "base",
    },
    Teams: {
      Team1: {
        TeamGroup1: {
          Users: {
            Leads: {
              gwely: {
                Slack_Name: "andrew.curcie",
                Slack_Id: "<@1111>",
              },
            },
            Members: {
              EthanTPainter: {
                Slack_Name: "ethan.painter",
                Slack_Id: "<@2222>",
              },
              DillonSykes: {
                Slack_Name: "dillon.sykes",
                Slack_Id: "<@3333>",
              },
            },
          },
        },
      },
    },
  };

  it("should construct an ApprovePR object", async () => {
    const ReviewClass = new Review();
    const expectedReviews = [
      {
        user: {
          login: "EthanTPainter",
        },
        state: "COMMENTED",
      },
      {
        user: {
          login: "gwely",
        },
        state: "APPROVED",
      },
      {
        user: {
          login: "DillonSykes",
        },
        state: "CHANGES_REQUESTED",
      },
      {
        user: {
          login: "DillonSykes",
        },
        state: "APPROVED",
      }];

    // Stub getReviews
    sinon.stub(ReviewClass, "getReviews")
      .resolves(expectedReviews);

    const result = await constructApprove(ReviewClass, validEvent, validJSON);

    // Expect SlackUser slack names to be in ApprovePR description
    expect((result.description)
      .includes(validJSON.Teams.Team1.TeamGroup1.Users.Leads.gwely.Slack_Name))
      .to.be.equal(true);
    expect((result.description)
      .includes(validJSON.Teams.Team1.TeamGroup1.Users.Members.EthanTPainter.Slack_Id))
      .to.be.equal(true);

    // Expect title, url, owner, and sender in ApprovePR
    expect(result.title).to.be.equal(validEvent.pull_request.title);
    expect(result.url).to.be.equal(validEvent.pull_request.html_url);
    expect(result.owner).to.be.equal(validEvent.pull_request.user.login);
    expect(result.user_approving).to.be.equal(validEvent.sender.login);

    // Expect approvals to be properly formatted
    expect((result.approvals)
      .includes(validJSON.Options.Num_Required_Peer_Approvals
        + " Required Peer")).to.be.equal(true);
    expect((result.approvals)
      .includes(validJSON.Teams.Team1.TeamGroup1.Users.Members.DillonSykes.Slack_Name
        + " :heavy_check_mark:")).to.be.equal(true);
    expect((result.approvals)
      .includes(validJSON.Options.Num_Required_Lead_Approvals
        + " Required Lead")).to.be.equal(true);
    expect((result.approvals)
      .includes(validJSON.Teams.Team1.TeamGroup1.Users.Leads.gwely.Slack_Name
        + " :heavy_check_mark:")).to.be.equal(true);
  });
});
