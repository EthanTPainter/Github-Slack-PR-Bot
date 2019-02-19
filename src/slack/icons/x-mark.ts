
/**
 * @description Get X for slack message
 * @param json Config json file
 * @param custom Custom input for slack message X mark
 *               (i.e. Provide slack text for own slack icon)
 * @options Parameter options are:
 *          1) base
 *          2) multiply
 *          3) box
 *          4) custom
 */
export function getXMark(
  json: any,
  custom?: string,
): string {

  // Error Handling
  if (json === undefined) {
    throw new Error("JSON is undefined");
  }
  if (json.Options === undefined) {
    throw new Error("json.Options is undefined");
  }
  if (json.Options.X_Mark_Style === undefined) {
    throw new Error("json.Options.X_Mark_Style is undefined");
  }
  if (json.Options.X_Mark_Style === "custom" && custom === undefined || custom === "") {
    throw new Error("X_Mark_Style is custom, but no custom input provided");
  }
  // Negative Mark (X) logic
  switch (json.Options.X_Mark_Style) {
    case "base": {
      return ":X:";
    }
    case "multiply": {
      return ":heavy_multiplication_x:";
    }
    case "box": {
      return ":negative_squared_cross_mark:";
    }
    case "custom": {
      return custom!;
    }
    default: {
      throw new Error("Unsupported X_Mark_Style provided");
    }
  }
}
