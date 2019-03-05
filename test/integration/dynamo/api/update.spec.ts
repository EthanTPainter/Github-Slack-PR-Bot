import { expect } from "chai";
import { json } from "../../json";
import {
  DynamoGet,
  DynamoReset,
  DynamoUpdate,
} from "../../../../src/dynamo/api";

describe("DynamoUpdate", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();
  const dynamoUpdate = new DynamoUpdate();
  const slackUser = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;

  // Reset slackUser's queue before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  // Reset slackUser's queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  it("should update an empty queue with one PR", async () => {
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
    await dynamoUpdate.updatePullRequest(slackUser.Slack_Id,
      [],
      newPR);

    const expectedQueue = [ newPR ];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

  it("should update an existing PR with a new PR", async () => {
    const currentQueue = [{
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
    }];
    const updatedPR = {
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
      }, {
        user: slackUser,
        action: "COMMENTED",
        time: "NEW TIME",
      }],
    };
    await dynamoUpdate.updatePullRequest(slackUser.Slack_Id,
      currentQueue,
      updatedPR);

    const expectedQueue = [ updatedPR ];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

});
