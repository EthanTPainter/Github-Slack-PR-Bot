import { expect } from "chai";
import { DateTime } from "luxon";
import { json } from "../../json";
import {
  DynamoGet,
  DynamoReset,
  DynamoAppend,
} from "../../../../src/dynamo/api";
import { PullRequest } from "../../../../src/models";

describe("DynamoAppend", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();
  const dynamoAppend = new DynamoAppend();
  const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;

  // Reset queue for slackUser before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  // Reset queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(slackUser.Slack_Id);
  });

  it("should append one PR to a slack user's empty queue", async () => {
    const currentQueue: any = [];

    const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const newPR: PullRequest = {
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE",
      url: "VALID PR URL",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: currentTime,
      }],
    };

    await dynamoAppend.appendPullRequest(slackUser.Slack_Id,
      currentQueue,
      newPR);
    const expectedQueue = [newPR];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

  it("should append one PR to a slack user's queue with 1 PR", async () => {
    const firstPRTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const currentQueue = [{
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE",
      url: "VALID PR URL",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: firstPRTime,
      }],
    }];
    const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const newPR = {
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE #2",
      url: "VALID PR URL #2",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: currentTime,
      }],
    };

    await dynamoAppend.appendPullRequest(slackUser.Slack_Id,
      currentQueue,
      newPR);

    const expectedQueue = [currentQueue[0], newPR];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

  it("should append one PR to a slack user's queue with 2 PR", async () => {
    const firstPRTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const currentQueue = [{
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE",
      url: "VALID PR URL",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: firstPRTime,
      }],
    }, {
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE #2",
      url: "VALID PR URL #2",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "COMMENTED",
        time: firstPRTime,
      }],
    }];

    const newPRTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const newPR = {
      owner: {
        Slack_Id: slackUser.Slack_Id,
        Slack_Name: slackUser.Slack_Name,
      },
      title: "VALID PR TITLE #3",
      url: "VALID PR URL #3",
      members_alert: [],
      members_approving: [],
      member_complete: false,
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackUser,
        action: "OPENED",
        time: newPRTime,
      }],
    };

    await dynamoAppend.appendPullRequest(slackUser.Slack_Id,
      currentQueue,
      newPR);
    const expectedQueue = [currentQueue[0], currentQueue[1], newPR];
    const retrievedQueue = await dynamoGet.getQueue(slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });
});
