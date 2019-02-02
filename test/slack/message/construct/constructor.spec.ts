import { constructSlackMessage } from "../../../../src/slack/message/construct";

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
      login: "GitHub_User_2",
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
        login: "GitHub_User_1",
      },
      html_url: "https://github.com/",
    },
  };

  it("should construct an opened PR slack message", async () => {
    const action = "opened";

    const result = await constructSlackMessage(action, event);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    console.log("Opened PR Slack Message: \n", result);

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a reopened PR slack message", async () => {
    const action = "reopened";

    const result = await constructSlackMessage(action, event);
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

    const result = await constructSlackMessage(action, event);
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

    const result = await constructSlackMessage(action, event);
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

    expect(1).to.be.equal(2);
    /*  COME BACK AND VALIDATE AT A LATER DATE
    const result = constructSlackMessage(action, event);
    const realAction = "approved";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
    */
  });

  it("should construct a request changes PR slack message", async () => {
    const action = "submitted";
    event.review.state = "changes_requested";

    const result = await constructSlackMessage(action, event);
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

    const result = await constructSlackMessage(action, event);
    const realAction = "commented";
    const expUrl = event.pull_request.html_url;

    console.log("Commented PR Slack Message: \n", result);

    expect(result.includes(realAction)).to.be.equal(true);
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

    await (constructSlackMessage(action, invalidEvent)).should.be.rejectedWith(Error, expected.message);
  });

  it("should throw error -- unsupported event type", async () => {
    const invalidAction = "PullRequest";

    const expected = new Error(`event action ${invalidAction} not supported in this application`);

    await (constructSlackMessage(invalidAction, event)).should.be.rejectedWith(Error, expected.message);
  });

});
