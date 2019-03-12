import { expect } from "chai";
import { json } from "../../../json";
import { DynamoReset, DynamoGet, DynamoUpdate } from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateMerge } from "../../../../../src/dynamo/update";

describe("Update.DynamoMerge", () => {

  const dynamoReset = new DynamoReset();
  const dynamoGet = new DynamoGet();
  const dynamoUpdate = new DynamoUpdate();

  const slackTeam = json.Departments.Devs.DevTeam1.Slack_Group;
  const slackLead1 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
  const slackLead2 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
  const slackLead3 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
  const slackMember1 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
  const slackMember2 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
  const slackMember3 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember3;

  // Reset queue for all slack users before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackTeam.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  // Reset each queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackTeam.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  it("should update a queue with a merged PR -- alert members before leads", async () => {
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      members_alert: [slackMember2.Slack_Id,
      slackMember3.Slack_Id],
      members_approving: [],
      member_complete: false,
      leads_alert: [slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }],
    };
    const event = {
      pull_request: {
        title: "NEW PR TITLE",
        html_url: "www.github.com/ethantpainter",
      },
    };
    // Add PR to all only member & team queues
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember2.Slack_Id,
      [],
      newPR);
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember3.Slack_Id,
      [],
      newPR);
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackTeam.Slack_Id,
      [],
      newPR);

    // Update Queues to close/remove the PR
    await updateMerge(
      slackMember1,
      slackMember1,
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

    expect(teamQueue).deep.equal([]);
    expect(lead1Queue).deep.equal([]);
    expect(lead2Queue).deep.equal([]);
    expect(lead3Queue).deep.equal([]);
    expect(member1Queue).deep.equal([]);
    expect(member2Queue).deep.equal([]);
    expect(member3Queue).deep.equal([]);
  });

  it("should update queues with a closed PR -- other PRs in queues", async () => {
    const originalPR = {
      owner: slackMember1,
      title: "ORIGINAL TITLE",
      url: "www.github.com/coveros",
      members_alert: [slackMember3.Slack_Id],
      members_approving: [],
      member_complete: false,
      leads_alert: [slackLead2.Slack_Id],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }],
    };
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      members_alert: [slackMember1.Slack_Id,
        slackMember3.Slack_Id],
      members_approving: [],
      member_complete: false,
      leads_alert: [slackLead1.Slack_Id,
        slackLead2.Slack_Id],
      leads_approving: [],
      lead_complete: false,
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }],
    };
    const event = {
      pull_request: {
        title: "NEW PR TITLE",
        html_url: "www.github.com/ethantpainter",
      },
    };

    // Add original PR to specific member, lead, & team queues
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember3.Slack_Id,
      [originalPR],
      newPR);
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackLead2.Slack_Id,
      [originalPR],
      newPR);
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackTeam.Slack_Id,
      [originalPR],
      newPR);

    // Add newPR to specific member, lead, & team queues
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackMember1.Slack_Id,
      [],
      newPR);
    await dynamoUpdate.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackLead1.Slack_Id,
      [],
      newPR);

    // Update Queues to close/remove the PR
    await updateMerge(
      slackMember1,
      slackMember1,
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

    expect(teamQueue).deep.equal([originalPR]);
    expect(lead1Queue).deep.equal([]);
    expect(lead2Queue).deep.equal([originalPR]);
    expect(lead3Queue).deep.equal([]);
    expect(member1Queue).deep.equal([]);
    expect(member2Queue).deep.equal([]);
    expect(member3Queue).deep.equal([originalPR]);
  });

});
