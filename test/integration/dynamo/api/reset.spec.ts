import { expect } from "chai";
import { json } from "../../json";
import {
  DynamoGet,
  DynamoReset,
  DynamoAppend,
} from "../../../../src/dynamo/api";

describe("DynamoReset", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();
  const dynamoAppend = new DynamoAppend();
  const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;

  // Reset slackUser's queue before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  // Reset slackUser's queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  it("Reset a slack user's queue with 1 PR previously", async () => {
    const newPR = {
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE #1",
      url: "VALID PR URL #1",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: "NOW",
      }],
    };
    await dynamoAppend.appendPullRequest(slackUser.Slack_Id,
      [],
      newPR);
    await dynamoReset.resetQueue(slackUser.Slack_Id);

    const expectedQueue: any = [];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

});
