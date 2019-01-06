import "mocha";
import { expect } from "chai";
import { getTitle } from "../../../../../src/github/parse";

describe("getTitle", () => {

  it("should retrieve the title of the PR", () => {
    const event = {
      pull_request: {
        title: "Title of the PR",
      },
    };

    const result = getTitle(event);
    const expected = event.pull_request.title;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No event.pull_request.title", () => {
    const event = {
      pull_request: {
        title: undefined,
      },
    };

    const expected = new Error("event.pull_request.title is undefined");

    expect(() => getTitle(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getTitle(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getTitle(event)).to.throw(expected.message);
  });
});
