import "mocha";
import { expect } from "chai";
import { getPRLink } from "../../../../../src/github/parse";

describe("getPRLink", () => {
  it("should retrieve the html url from the event", () => {
    const event = {
      pull_request: {
        html_url: "https://api.github.com",
      },
    };

    const result = getPRLink(event);
    const expected = event.pull_request.html_url;

    expect(result).to.to.equal(expected);
  });

  it("should throw an error -- No event.pull_request.html_url", () => {
    const event = {
      pull_request: {
        html_url: undefined,
      },
    };

    const expected = new Error("event.pull_request.html_url is undefined");

    expect(() => getPRLink(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getPRLink(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getPRLink(event)).to.throw(expected.message);
  });
});
