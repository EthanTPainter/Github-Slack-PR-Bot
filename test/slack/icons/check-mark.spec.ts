import { expect } from "chai";
import { getCheckMark } from "../../../src/slack/icons/check-mark";

describe("getCheckMark", () => {

  const validJSON = {
    Options: {
      Check_Mark_Style: "value",
    },
  };

  it("should construct a green check mark", () => {
    validJSON.Options.Check_Mark_Style = "green";

    const result = getCheckMark(validJSON);
    const expected = ":heavy_check_mark:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a white check mark", () => {
    validJSON.Options.Check_Mark_Style = "white";

    const result = getCheckMark(validJSON);
    const expected = ":white_check_mark:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a ballot box check mark", () => {
    validJSON.Options.Check_Mark_Style = "ballot";

    const result = getCheckMark(validJSON);
    const expected = ":ballot_box_with_check:";

    expect(result).to.be.equal(expected);
  });

  it("should construct a custom check mark", () => {
    validJSON.Options.Check_Mark_Style = "custom";
    const customCheckMark = ":something_neat:";

    const result = getCheckMark(validJSON, customCheckMark);
    const expected = ":something_neat:";

    expect(result).to.be.equal(expected);
  });

  it("should throw error -- json undefined", () => {
    const json = undefined;

    const expected = new Error("JSON is undefined");

    expect(() => getCheckMark(json))
      .to.throw(expected.message);
  });

  it("should throw error -- json.Options undefined", () => {
    const json = {};

    const expected = new Error("json.Options is undefined");

    expect(() => getCheckMark(json))
      .to.throw(expected.message);
  });

  it("should throw error -- Checkmark_Style is undefined", () => {
    const json = {
      Options: {},
    };

    const expected = new Error("json.Options.Check_Mark_Style is undefined");

    expect(() => getCheckMark(json))
      .to.throw(expected.message);
  });

  it("should throw error -- No custom input provided", () => {
    const json = {
      Options: {
        Check_Mark_Style: "custom",
      },
    };

    const expected = new Error("Check_Mark_Style is custom, but no custom input provided");

    expect(() => getCheckMark(json))
      .to.throw(expected.message);
  });

  it("should throw error -- Empty custom input provided", () => {
    const json = {
      Options: {
        Check_Mark_Style: "custom",
      },
    };
    const custom = "";

    const expected = new Error("Check_Mark_Style is custom, but no custom input provided");

    expect(() => getCheckMark(json, custom))
      .to.throw(expected.message);
  });

  it("should throw error -- Unsupported checkmark style", () => {
    const json = {
      Options: {
        Check_Mark_Style: "surprise",
      },
    };

    const expected = new Error("Unsupported Check_Mark_Style provided");

    expect(() => getCheckMark(json))
      .to.throw(expected.message);
  });
});
