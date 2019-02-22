import { expect } from "chai";
import { getPRBranch } from "../../../../../src/github/parse";

describe("getPRBranch", () => {

  it("should retrieve the branch with the PR", () => {
    const event = {
      pull_request: {
        head: {
          ref: "feat-branch-123",
        },
      },
    };

    const result = getPRBranch(event);
    const expected = event.pull_request.head.ref;

    expect(result).equal(expected);
  });

  it("should throw an error -- No event.pull_request.head.ref", () => {
    const event = {
      pull_request: {
        head: {
          ref: undefined,
        },
      },
    };

    const expected = new Error("event.pull_request.head.ref ");

    expect(() => getPRBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request.head", () => {
    const event = {
      pull_request: {
        head: undefined,
      },
    };

    const expected = new Error("event.pull_request.head is undefined");

    expect(() => getPRBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getPRBranch(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getPRBranch(event)).to.throw(expected.message);
  });
});
