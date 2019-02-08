import { expect } from "chai";
import { postEphemeral } from "../../../src/slack/api";

describe("postEphemeral", () => {

  it("successfully post message to slack channel", () => {
    const slackApiUrl = "https://slack.com/api";
    const slackChannel = "#message-tester";
    const slackToken = process.env.DEV_TEAM_1_SLACK_TOKEN!;
    const slackMessage = "Hello from bot! This is success";

    /*const result = postEphemeral(
      slackApiUrl,
      slackChannel,
      slackToken,
      slackMessage);

    console.log("Result: ", result);
    */
  });
});
