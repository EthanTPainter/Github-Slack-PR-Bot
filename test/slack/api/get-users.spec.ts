import { expect } from "chai";
import { getUsers } from "../../../src/slack/api";

describe("getUsers", () => {

  it("Should get list of users for an org", async () => {
    const slackApiUrl = "https://slack.com/api";
    const slackToken = process.env.DEV_TEAM_1_SLACK_TOKEN!;

    // const result = await getUsers(slackApiUrl, slackToken);
    // console.log(result);
  });

});
