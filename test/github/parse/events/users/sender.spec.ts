import { expect } from "chai";
import { getSender } from "../../../../../src/github/parse/events/users";

describe("getSender", () => {

  it("should retrieve sender of the event", () => {
    const event = {
      sender: {
        login: "EthanTPainter",
      },
    };

    const result = getSender(event);
    const expected = event.sender.login;

    expect(result).equal(expected);
  });

  it("should throw an error -- No event.sender.login", () => {
    const event = {
      sender: {
        login: undefined,
      },
    };

    const expected = new Error("event.sender.login is undefined");

    expect(() => getSender(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.sender", () => {
    const event = {
      sender: undefined,
    };

    const expected = new Error("event.sender is undefined");

    expect(() => getSender(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getSender(event)).to.throw(expected.message);
  });
});
