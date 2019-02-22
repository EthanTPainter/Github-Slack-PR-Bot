import { expect } from "chai";
import { getBaseBranch } from "../../../../../src/github/parse";

describe("getBaseBranch", () => {

  it("should retrieve the base Branch", () => {
    const event = {
      pull_request: {
        base: {
          ref: "master",
        },
      },
    };

    const result = getBaseBranch(event);
    const expected = event.pull_request.base.ref;

    expect(result).equal(expected);
  });

  it("should throw an error -- No event.pull_request.base.ref", () => {
    const event = {
      pull_request: {
        base: {
          ref: undefined,
        },
      },
    };

    const expected = new Error("event.pull_request.base.ref is undefined");

    expect(() => getBaseBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request.base", () => {
    const event = {
      pull_request: {
        base: undefined,
      },
    };

    const expected = new Error("event.pull_request.base is undefined");

    expect(() => getBaseBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getBaseBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getBaseBranch(event)).to.throw(expected.message);
  });

});
