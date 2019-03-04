import { expect } from "chai";
import { getPath } from "../../../../../../src/github/parse";

describe("getPath", () => {
  it("should retrieve the path ", () => {
    const event = {
      pull_request: {
        url: "https://api.github.com",
      },
    };

    const result = getPath(event);
    const expected = event.pull_request.url + "/reviews";

    expect(result).equal(expected);
  });

  it("should throw an error -- No event.pull_request.url", () => {
    const event = {
      pull_request: {
        url: undefined,
      },
    };

    const expected = new Error("event.pull_request.url is undefined");

    expect(() => getPath(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getPath(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getPath(event)).to.throw(expected.message);
  });
});
