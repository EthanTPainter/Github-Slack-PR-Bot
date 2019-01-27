import "mocha";
import { expect } from "chai";
import { constructSlackMessage, constructOpen } from "../../../../src/slack/message/construct";

describe("constructSlackMessage", () => {
  const event = {
    pull_request: {
      title: "feature(123): Adding new service",
      user: {
        login: "GitHub_User_1",
      },
      html_url: "https://github.com/",
    },
  };

  it("should correctly construct an opened PR", () => {
    const action = "opened";

    const result = constructSlackMessage(action, event);
    const expDesc = "Slack_user_1 opened this PR. Needs *peer* and *lead* reviews @Group_Slack_Name";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(expDesc)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should correctly construct a reopened PR", () => {
    const action = "reopened";

    const result = constructSlackMessage(action, event);
    const expDesc = "Slack_user_1 reopened this PR. Needs *peer* and *lead* reviews @Group_Slack_Name";
    const expTitle = event.pull_request.title;
    const expUrl = event.pull_request.html_url;

    expect(result.includes(expDesc)).to.be.equal(true);
    expect(result.includes(expTitle)).to.be.equal(true);
    expect(result.includes(expUrl)).to.be.equal(true);
  });

  it("should throw error -- unsupported event type", () => {
    const action = "PullRequest";

    const expected = new Error(`event action ${action} not supported in this application`);

    expect(() => constructSlackMessage(action, event))
      .to.throw(expected.message);
  });
});
