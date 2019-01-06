import "mocha";
import { expect } from "chai";
import { getPrivateProp } from "../../../../../src/github/parse";

describe("getPrivateProp", () => {

  it("should retrieve private property value", () => {
    const event = {
      repository: {
        private: true,
      },
    };

    const result = getPrivateProp(event);
    const expected = event.repository.private;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No event.repository.private", () => {
    const event = {
      repository: {
        private: undefined,
      },
    };

    const expected = new Error("event.repository.private is undefined");

    expect(() => getPrivateProp(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event.repository", () => {
    const event = {
      repository: undefined,
    };

    const expected = new Error("event.repository is undefined");

    expect(() => getPrivateProp(event)).to.throw(expected.message);
  });

  it("should throw an error -- No event", () => {
    const event = undefined;

    const expected = new Error("event is undefined");

    expect(() => getPrivateProp(event)).to.throw(expected.message);
  });
});
