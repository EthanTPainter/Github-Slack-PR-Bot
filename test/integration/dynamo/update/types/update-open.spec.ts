import { expect } from "chai";
import { json } from "../../../json";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateOpen } from "../../../../../src/dynamo/update";
import {
  DynamoGet,
  DynamoReset,
} from "../../../../../src/dynamo/api";

describe("Dynamo.UpdateOpen", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();

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

  it("should update a queue with an opened PR -- owned by a member & alert members before leads", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
    const event = {
      pull_request: {
        title: "NEW PR TITLE",
        html_url: "www.github.com/ethantpainter",
      },
    };

    await updateOpen(
      slackMember1,
      slackTeam,
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

    const expectedUpdatedQueue = [{
      events: [{
        action: "OPENED",
        time: "March 6, 2019, 10:12:26 PM EST",
        user: {
          Slack_Id: "<SlackMemberId1>",
          Slack_Name: "SlackMemberName1",
        },
      }],
      lead_complete: false,
      leads_alert: [],
      leads_approving: [],
      member_complete: false,
      members_alert: [
        "<SlackMemberId2>",
        "<SlackMemberId3>",
      ],
      members_approving: [],
      owner: {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      },
      title: "NEW PR TITLE",
      url: "www.github.com/ethantpainter",
    }];

    // Expect the PR owner to not have the PR added to it
    // Reason: Don't alert (@) the person who made the PR
    expect(member1Queue).deep.equal([]);

    // Expect the leads to not have the PR added to their queues
    // Reason: Member_Before_Lead set to true
    expect(lead1Queue).deep.equal([]);
    expect(lead2Queue).deep.equal([]);
    expect(lead3Queue).deep.equal([]);

    // Expect team queue to be updated with the PR
    expect(teamQueue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(teamQueue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(teamQueue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(teamQueue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(teamQueue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(teamQueue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(teamQueue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(teamQueue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(teamQueue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(teamQueue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(teamQueue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(teamQueue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    // Expect all members (except owner) to have the PR in their queues
    expect(member2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member2Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(member2Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(member2Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(member2Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(member2Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(member2Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(member2Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(member2Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(member2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member2Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(member2Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    expect(member3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member3Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(member3Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(member3Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(member3Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(member3Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(member3Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(member3Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(member3Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(member3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member3Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(member3Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);
  });

  it("should update a queue with an opened PR -- owned by a member & alert members & leads", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
    const event = {
      pull_request: {
        title: "NEW PR TITLE",
        html_url: "www.github.com/ethantpainter",
      },
    };

    await updateOpen(
      slackMember1,
      slackTeam,
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

    const expectedUpdatedQueue = [{
      events: [{
        action: "OPENED",
        time: "March 6, 2019, 10:12:26 PM EST",
        user: {
          Slack_Id: "<SlackMemberId1>",
          Slack_Name: "SlackMemberName1",
        },
      }],
      lead_complete: false,
      leads_alert: [
        "<SlackLeadId1>",
        "<SlackLeadId2>",
        "<SlackLeadId3>",
      ],
      leads_approving: [],
      member_complete: false,
      members_alert: [
        "<SlackMemberId2>",
        "<SlackMemberId3>",
      ],
      members_approving: [],
      owner: {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      },
      title: "NEW PR TITLE",
      url: "www.github.com/ethantpainter",
    }];

    // Expect the PR owner to not have the PR added to it
    // Reason: Don't alert (@) the person who made the PR
    expect(member1Queue).deep.equal([]);

    // Expect team queue to be updated with the PR
    expect(teamQueue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(teamQueue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(teamQueue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(teamQueue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(teamQueue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(teamQueue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(teamQueue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(teamQueue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(teamQueue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(teamQueue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(teamQueue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(teamQueue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    // Expect leads and members to have the PR added
    expect(lead1Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead1Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(lead1Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(lead1Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(lead1Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(lead1Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(lead1Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(lead1Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(lead1Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(lead1Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead1Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(lead1Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    expect(lead2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead2Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(lead2Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(lead2Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(lead2Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(lead2Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(lead2Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(lead2Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(lead2Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(lead2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead2Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(lead2Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    expect(lead3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead3Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(lead3Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(lead3Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(lead3Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(lead3Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(lead3Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(lead3Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(lead3Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(lead3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(lead3Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(lead3Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    expect(member2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member2Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(member2Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(member2Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(member2Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(member2Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(member2Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(member2Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(member2Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(member2Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member2Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(member2Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);

    expect(member3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member3Queue[0].events[0].user).deep.equal(expectedUpdatedQueue[0].events[0].user);
    expect(member3Queue[0].lead_complete).deep.equal(expectedUpdatedQueue[0].lead_complete);
    expect(member3Queue[0].leads_alert).deep.equal(expectedUpdatedQueue[0].leads_alert);
    expect(member3Queue[0].leads_approving).deep.equal(expectedUpdatedQueue[0].leads_approving);
    expect(member3Queue[0].member_complete).deep.equal(expectedUpdatedQueue[0].member_complete);
    expect(member3Queue[0].members_alert).deep.equal(expectedUpdatedQueue[0].members_alert);
    expect(member3Queue[0].members_approving).deep.equal(expectedUpdatedQueue[0].members_approving);
    expect(member3Queue[0].owner).deep.equal(expectedUpdatedQueue[0].owner);
    expect(member3Queue[0].events[0].action).deep.equal(expectedUpdatedQueue[0].events[0].action);
    expect(member3Queue[0].title).deep.equal(expectedUpdatedQueue[0].title);
    expect(member3Queue[0].url).deep.equal(expectedUpdatedQueue[0].url);
  });

});
