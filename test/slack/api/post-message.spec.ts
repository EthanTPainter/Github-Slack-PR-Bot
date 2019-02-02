import { expect } from "chai";
import { postMessage } from "../../../src/slack/api";

describe("postMessage", () => {
  it("successfully post message to slack channel", () => {
    const slackApiUrl = "https://slack.com/api";
    const slackChannel = "#message-tester";
    const slackToken = process.env.DEV_TEAM_1_SLACK_TOKEN!;
    const slackMessage = "Hello from bot! This is success";

    /*const result = postMessage(slackApiUrl,
                               slackChannel,
                               slackToken,
                               slackMessage);

    console.log("Result: ", result);
    */
  });
});
