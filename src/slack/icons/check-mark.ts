
/**
 * @author Ethan T Painter
 * @description Get check for slack message
 * @param json Config json file
 * @param custom Custom input for slack message check mark
 *               (i.e. Provide slack text for my own slack icon)
 * @options Parameter options are:
 *          1) green
 *          2) white
 *          3) ballot
 *          4) custom
 */
export function getCheckMark(
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
  if (json.Options.Check_Mark_Style === undefined) {
    throw new Error("json.Options.Check_Mark_Style is undefined");
  }
  if (json.Options.Check_Mark_Style === "custom" && custom === undefined || custom === "") {
    throw new Error("Check_Mark_Style is custom, but no custom input provided");
  }
  // Checkmark logic
  switch (json.Options.Check_Mark_Style) {
    case "green": {
      return ":heavy_check_mark:";
    }
    case "white": {
      return ":white_check_mark:";
    }
    case "ballot": {
      return ":ballot_box_with_check:";
    }
    case "custom": {
      return custom!;
    }
    default: {
      throw new Error("Unsupported Check_Mark_Style provided");
    }
  }
}
