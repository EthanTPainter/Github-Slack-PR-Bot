import { expect } from "chai";
import { DateTime } from "luxon";
import { json } from "../../json";
import {
  DynamoGet,
  DynamoReset,
  DynamoAppend,
} from "../../../../src/dynamo/api";
import { PullRequest } from "../../../../src/models";
import { requiredEnvs } from "../../../../src/required-envs";

describe("Dynamo.Append", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();
  const dynamoAppend = new DynamoAppend();
  const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;

  // Reset queue for slackUser before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);
  });

  // Reset queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);
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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: currentTime,
      }],
    };

    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      currentQueue,
      newPR);
    const expectedQueue = [newPR];
    const retrievedQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser);

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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: currentTime,
      }],
    };

    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      currentQueue,
      newPR);

    const expectedQueue = [currentQueue[0], newPR];
    const retrievedQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser);

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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
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
      comment_times: {},
      standard_members_alert: [],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: newPRTime,
      }],
    };

    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      currentQueue,
      newPR);
    const expectedQueue = [currentQueue[0], currentQueue[1], newPR];
    const retrievedQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });
});
