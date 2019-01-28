import "mocha";
import { expect } from "chai";
import { constructSlackMessage } from "../../../../src/slack/message/construct";

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

  it("should construct an opened PR slack message", () => {
    const action = "opened";

    const result = constructSlackMessage(action, event);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a reopened PR slack message", () => {
    const action = "reopened";

    const result = constructSlackMessage(action, event);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a closed PR slack message", () => {
    const action = "closed";
    event.pull_request.merged = false;

    const result = constructSlackMessage(action, event);
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(action)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a merged PR slack message", () => {
    const action = "closed";
    event.pull_request.merged = true;

    const result = constructSlackMessage(action, event);
    const realAction = "merged";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;
    const expBase = event.pull_request.base.ref;
    const expHead = event.pull_request.head.ref;

    expect(result.includes(expBase)).to.be.equal(true);
    expect(result.includes(expHead)).to.be.equal(true);
    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  /*
  it("should construct an approved PR slack message", () => {
    const action = "submitted";
    event.review.state = "approved";

    const result = constructSlackMessage(action, event);
    const realAction = "approved";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });
  */

  it("should construct a request changes PR slack message", () => {
    const action = "submitted";
    event.review.state = "changes_requested";

    const result = constructSlackMessage(action, event);
    const realAction = "requested changes";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should construct a commented PR slack message", () => {
    const action = "submitted";
    event.review.state = "commented";

    const result = constructSlackMessage(action, event);
    const realAction = "commented";
    const expUrl = event.pull_request.html_url;

    expect(result.includes(realAction)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should throw error -- unsupported review state", () => {
    const action = "submitted";
    const invalidEvent = {
      review: {
        state: "removed",
      },
    };

    const expected = new Error(`Review submitted for PR. ` +
      `Unsupported event.review.state: ${invalidEvent.review.state}`);

    expect(() => constructSlackMessage(action, invalidEvent))
      .to.throw(expected.message);
  });

  it("should throw error -- unsupported event type", () => {
    const action = "PullRequest";

    const expected = new Error(`event action ${action} not supported in this application`);

    expect(() => constructSlackMessage(action, event))
      .to.throw(expected.message);
  });
});
