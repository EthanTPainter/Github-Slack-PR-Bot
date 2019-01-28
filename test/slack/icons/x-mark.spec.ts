import "mocha";
import { expect } from "chai";
import { getXMark } from "../../../src/slack/icons/x-mark";

describe("getXMark", () => {

  const validJSON = {
    Options: {
      X_Mark_Style: "value",
    },
  };

  it("should construct a basic X mark", () => {
    validJSON.Options.X_Mark_Style = "base";

    const result = getXMark(validJSON);
    const expected = ":X:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a heavy multiplication X mark", () => {
    validJSON.Options.X_Mark_Style = "multiply";

    const result = getXMark(validJSON);
    const expected = ":heavy_multiplication_x:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a boxed X mark", () => {
    validJSON.Options.X_Mark_Style = "box";

    const result = getXMark(validJSON);
    const expected = ":negative_squared_cross_mark:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a custom X mark", () => {
    validJSON.Options.X_Mark_Style = "custom";
    const custom = ":my_custom_x_mark:";

    const result = getXMark(validJSON, custom);
    const expected = custom;

    expect(result).to.be.equal(expected);
  });

  it("should throw error -- json undefined", () => {
    const invalidJSON = undefined;

    const expected = new Error("JSON is undefined");

    expect(() => getXMark(invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- json.Options is undefined", () => {
    const invalidJSON = {};

    const expected = new Error("json.Options is undefined");

    expect(() => getXMark(invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- json.Options.X_Mark_Style", () => {
    const invalidJSON = {
      Options: {},
    };

    const expected = new Error("json.Options.X_Mark_Style is undefined");

    expect(() => getXMark(invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- no custom input param", () => {
    const invalidJSON = {
      Options: {
        X_Mark_Style: "custom",
      },
    };

    const expected = new Error("X_Mark_Style is custom, but no custom input provided");

    expect(() => getXMark(invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- Unsupported X_Mark_Style", () => {
    const invalidJSON = {
      Options: {
        X_Mark_Style: "something neat",
      },
    };

    const expected = new Error("Unsupported X_Mark_Style provided");

    expect(() => getXMark(invalidJSON))
      .to.throw(expected.message);
  });
});
