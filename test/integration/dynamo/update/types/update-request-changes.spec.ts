import { expect } from "chai";
import { json } from "../../../json";
import { requiredEnvs } from "../../../../../src/required-envs";
import {
  updateReqChanges,
} from "../../../../../src/dynamo/update";
import {
  DynamoGet,
  DynamoReset,
  DynamoAppend,
} from "../../../../../src/dynamo/api";

describe.only("updateReqChanges", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();
  const dynamoAppend = new DynamoAppend();

  const slackTeam = json.Departments.Devs.DevTeam1.Slack_Group;
  const slackLead1 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
  const slackLead2 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
  const slackLead3 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
  const slackMember1 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
  const slackMember2 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
  const slackMember3 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3;

  beforeEach(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackTeam.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  // afterEach(async () => {
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackTeam.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
  //   await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  // });

  it("member request changes & req changes stop alerts", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
    json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/aws/firecracker",
      members_alert: [slackMember2.Slack_Id,
      slackMember3.Slack_Id],
      members_approving: [],
      member_complete: false,
      members_req_changes: [],
      leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }],
    };
    const event = {
      pull_request: {
        html_url: "www.github.com/aws/firecracker",
      },
    };
    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember2.Slack_Id,
      [],
      newPR);
    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember3.Slack_Id,
      [],
      newPR);
    await dynamoAppend.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackTeam.Slack_Id,
      [],
      newPR);

    await updateReqChanges(
      slackMember1,
      slackMember2,
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      event,
      json);

    const teamQueue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackTeam.Slack_Id);
    const lead1Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackLead1.Slack_Id);
    const lead2Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackLead2.Slack_Id);
    const lead3Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackLead3.Slack_Id);
    const member1Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember1.Slack_Id);
    const member2Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember2.Slack_Id);
    const member3Queue = await dynamoGet.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember3.Slack_Id);

    // Team queue should be up to date
    expect(teamQueue[0].url).equal(newPR.url);
    expect(teamQueue[0].member_complete).equal(false);
    expect(teamQueue[0].members_approving).deep.equal([]);
    expect(teamQueue[0].members_alert).deep.equal([slackMember3.Slack_Id]);
    expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);

    // PR Owner should have an empty queue
    expect(member1Queue).deep.equal([]);

    // PR ReqChanges user should have an empty queue
    expect(member2Queue).deep.equal([]);

    // Leads should have empty queues
    expect(lead1Queue).deep.equal([]);
    expect(lead2Queue).deep.equal([]);
    expect(lead3Queue).deep.equal([]);

  });

});
