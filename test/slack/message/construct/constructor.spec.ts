import * as sinon from "sinon";
import { constructSlackMessage } from "../../../../src/slack/message/construct";
import { Review } from "../../../../src/github/api";

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("constructSlackMessage", () => {

  const event = {
    review: {
      state: "commented",
    },
    sender: {
      login: "DillonSykes",
    },
    pull_request: {
      url: "https://github.com",
      head: {
        ref: "feature-branch",
      },
      base: {
        ref: "dev",
      },
      merged: false,
      title: "feature(123): Adding new service",
      user: {
        login: "EthanTPainter",
      },
      html_url: "https://github.com/",
    },
  };

  const json = {
    Options: {
      Num_Required_Peer_Approvals: 2,
      Num_Required_Lead_Approvals: 2,
      Check_Mark_Style: "green",
      X_Mark_Style: "base",
    },
    Departments: {
      Dev: {
        Team1: {
          Slack_Group: "Slack_Group_Name",
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
              DanielLarner: {
                Slack_Name: "daniel.larner",
                Slack_Id: "<@4444>",
              },
            },
          },
        },
      },
    },
  };

  it("should construct an opened PR slack message", async () => {
    const action = "opened";

    const result = await constructSlackMessage(action, event, json);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("Opened PR Slack Message: \n", result);

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a reopened PR slack message", async () => {
    const action = "reopened";

    const result = await constructSlackMessage(action, event, json);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("Reopened PR Slack Message: \n", result);

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a closed PR slack message", async () => {
    const action = "closed";
    event.pull_request.merged = false;

    const result = await constructSlackMessage(action, event, json);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("Closed PR Slack Message: \n", result);

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a merged PR slack message", async () => {
    const action = "closed";
    event.pull_request.merged = true;

    const result = await constructSlackMessage(action, event, json);
    const realAction = "merged";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;
    const expBase = event.pull_request.base.ref;
    const expHead = event.pull_request.head.ref;

    console.log("Merged PR Slack Message: \n", result);

    expect(result.includes(expBase)).to.be.equal(true);
    expect(result.includes(expHead)).to.be.equal(true);
    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct an approved PR slack message", async () => {
    const action = "submitted";
    event.review.state = "approved";
    const reviewClass = new Review();

    const expectedReviews = [{
        user: { login: "EthanTPainter" },
        state: "COMMENTED",
      }, {
        user: { login: "gwely" },
        state: "APPROVED",
      }, {
        user: { login: "DillonSykes" },
        state: "CHANGES_REQUESTED",
      }, {
          user: { login: "DillonSykes" },
          state: "APPROVED",
      }];

    // Stub getReviews
    sinon.stub(reviewClass, "getReviews")
         .resolves(expectedReviews);

    const result = await constructSlackMessage(action, event, json, reviewClass);
    const realAction = "approved";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;
    const expNumPeer = json.Options.Num_Required_Peer_Approvals;
    const expNumLead = json.Options.Num_Required_Lead_Approvals;

    console.log("Result: ", result);

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
    expect(result.includes(expNumPeer + " Required Peer")).to.be.equal(true);
    expect(result.includes(expNumLead + " Required Lead")).to.be.equal(true);
  });

  it("should construct a request changes PR slack message", async () => {
    const action = "submitted";
    event.review.state = "changes_requested";

    const result = await constructSlackMessage(action, event, json);
    const realAction = "requested changes";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("ReqChanges PR Slack Message: \n", result);

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a commented PR slack message", async () => {
    const action = "submitted";
    event.review.state = "commented";

    const result = await constructSlackMessage(action, event, json);
    const realAction = "commented";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("Commented PR Slack Message: \n", result);

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should throw error -- unsupported review state", async () => {
    const action = "submitted";
    const invalidEvent = {
      review: {
        state: "removed",
      },
    };

    const expected = new Error(`Review submitted for PR. ` +
      `Unsupported event.review.state: ${invalidEvent.review.state}`);

    await (constructSlackMessage(action, invalidEvent, json)).should.be.rejectedWith(Error, expected.message);
  });

  it("should throw error -- unsupported event type", async () => {
    const invalidAction = "PullRequest";

    const expected = new Error(`event action ${invalidAction} not supported in this application`);

    await (constructSlackMessage(invalidAction, event, json)).should.be.rejectedWith(Error, expected.message);
  });

  it("should throw error -- approve type but reviewClass not provided", async () => {
    const action = "submitted";
    event.review.state = "approved";

    const expected = new Error("reviewClass parameter must be defined");

    await (constructSlackMessage(action, event, json)).should.be.rejectedWith(Error, expected.message);
  });

});
