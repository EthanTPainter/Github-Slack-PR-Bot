import { DateTime } from "luxon";
import { expect } from "chai";
import { json } from "../../json";
import {
  DynamoGet,
  DynamoRemove,
  DynamoReset,
  DynamoUpdate,
} from "../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../src/required-envs";

describe("Dynamo.Remove", () => {

  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();
  const dynamoReset = new DynamoReset();
  const dynamoUpdate = new DynamoUpdate();
  const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;

  // Reset slackUser's queue before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);
  });

  // Reset slackUser's queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);
  });

  it("should remove one PR from a slack user's queue (empty queue)", async () => {
    const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    const newPR = {
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
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      [],
      newPR);
    await dynamoRemove.removePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      [newPR],
      newPR);

    const expectedQueue: any = [];
    const retrievedQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

  it("should remove one PR from a slack user's queue (1 PR left in queue)", async () => {
    const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
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
        time: currentTime,
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
        action: "OPENED",
        time: currentTime,
      }],
    }];
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      [currentQueue[0]],
      currentQueue[1]);
    await dynamoRemove.removePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      currentQueue,
      currentQueue[1]);

    const expectedQueue = [currentQueue[0]];
    const retrievedQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);

    expect(expectedQueue).deep.equal(retrievedQueue);
  });

});
