import { expect } from "chai";
import { getOwner } from "../../../../../src/github/parse/events/users";

describe("getOwner", () => {

  it("should retrieve owner from event", () => {
    const event = {
      pull_request: {
        user: {
          login: "EthanTPainter",
        },
      },
    };

    const result = getOwner(event);
    const expected = event.pull_request.user.login;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- no event.pull_request.user.login", () => {
    const event = {
      pull_request: {
        user: {
          login: undefined,
        },
      },
    };

    const expected = new Error("event.pull_request.user.login is undefined");

    expect(() => getOwner(event)).to.throw(expected.message);
  });

  it("should throw an error -- no event.pull_request.user", () => {
    const event = {
      pull_request: {
        user: undefined,
      },
    };

    const expected = new Error("event.pull_request.user is undefined");

    expect(() => getOwner(event)).to.throw(expected.message);
  });

  it("should throw an error -- no event.pull_request", () => {
    const event = {
      pull_request: undefined,
    };

    const expected = new Error("event.pull_request is undefined");

    expect(() => getOwner(event)).to.throw(expected.message);
  });

  it("should throw an error -- no event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getOwner(event)).to.throw(expected.message);
  });

});
