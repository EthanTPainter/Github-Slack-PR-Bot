import { expect } from "chai";
import { json } from "../../../json";
import { DynamoGet, DynamoReset } from "../../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../../src/required-envs";
import { updateFixedPR } from "../../../../../src/dynamo/update";

describe("fixedPR", () => {

  const dynamoGet = new DynamoGet();
  const dynamoReset = new DynamoReset();

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

  after(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackTeam.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  it("should update a PR when fixed by PR owner -- member before lead & member req changes", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      standard_members_alert: [slackMember3.Slack_Id,
      slackMember1.Slack_Id],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [slackMember2.Slack_Id],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }, {
        user: slackMember2,
        action: "CHANGES_REQUESTED",
        time: "NEW NOW",
      }],
    };

    const slackString = await updateFixedPR(
      slackMember1.Slack_Id,
      newPR.url,
      [newPR],
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      json,
    );

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

    // Expect slack string to include specific information
    expect(slackString.includes(slackMember1.Slack_Name)).equal(true);
    expect(slackString.includes(newPR.url)).equal(true);
    expect(slackString.includes(slackMember2.Slack_Id)).equal(true);

    // Expect team queue to be up to date
    expect(teamQueue[0].url).equal(newPR.url);
    expect(teamQueue[0].owner).deep.equal(newPR.owner);
    expect(teamQueue[0].req_changes_leads_alert).deep.equal([]);
    expect(teamQueue[0].req_changes_members_alert).deep.equal([slackMember2.Slack_Id]);
    expect(teamQueue[0].standard_leads_alert).deep.equal([]);
    expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3.Slack_Id]);
    expect(teamQueue[0].events[0].action).equal("OPENED");
    expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
    expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
    expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
    expect(teamQueue[0].events[2].action).equal("FIXED_PR");
    expect(teamQueue[0].events[2].user).deep.equal(slackMember1);

    // Expect PR Owner queue to be empty
    expect(member1Queue).deep.equal([]);

    // Expect All other members to be alerted
    expect(member2Queue).deep.equal(teamQueue);
    expect(member3Queue).deep.equal(teamQueue);

    // Expect all lead queues to be empty (member before lead = true)
    expect(lead1Queue).deep.equal([]);
    expect(lead2Queue).deep.equal([]);
    expect(lead3Queue).deep.equal([]);
  });

  it("should update a PR when fixed by PR owner -- member before lead & lead req changes", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      standard_members_alert: [slackMember3.Slack_Id,
      slackMember2.Slack_Id,
      slackMember1.Slack_Id],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [slackLead1.Slack_Id],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }, {
        user: slackLead1,
        action: "CHANGES_REQUESTED",
        time: "NEW NOW",
      }],
    };

    const slackString = await updateFixedPR(
      slackMember1.Slack_Id,
      newPR.url,
      [newPR],
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      json,
    );

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

    // Expect slack String to have specific information
    expect(slackString.includes(slackMember1.Slack_Name)).equal(true);
    expect(slackString.includes(newPR.url)).equal(true);
    expect(slackString.includes(slackLead1.Slack_Id)).equal(true);

    // Team queue should be up to date
    expect(teamQueue[0].url).equal(newPR.url);
    expect(teamQueue[0].owner).deep.equal(newPR.owner);
    expect(teamQueue[0].req_changes_leads_alert).deep.equal([slackLead1.Slack_Id]);
    expect(teamQueue[0].req_changes_members_alert).deep.equal([]);
    expect(teamQueue[0].standard_leads_alert).deep.equal([]);
    expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3.Slack_Id,
    slackMember2.Slack_Id]);
    expect(teamQueue[0].events[0].action).equal("OPENED");
    expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
    expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
    expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
    expect(teamQueue[0].events[2].action).equal("FIXED_PR");
    expect(teamQueue[0].events[2].user).deep.equal(slackMember1);

    // PR Owner's queue should be empty
    expect(member1Queue).deep.equal([]);

    // Expect all other member queues to match team queue
    expect(member2Queue).deep.equal(teamQueue);
    expect(member3Queue).deep.equal(teamQueue);

    // Expect Lead who request changes to have
    // this PR in their queue
    expect(lead1Queue).deep.equal(teamQueue);

    // Expect all other lead queues to be empty
    expect(lead2Queue).deep.equal([]);
    expect(lead3Queue).deep.equal([]);
  });

  it("should update a PR when fixed by PR owner -- member & lead & member req changes", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      standard_members_alert: [slackMember3.Slack_Id,
      slackMember1.Slack_Id],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [],
      members_req_changes: [slackMember2.Slack_Id],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }, {
        user: slackMember2,
        action: "CHANGES_REQUESTED",
        time: "NEW NOW",
      }],
    };

    const slackString = await updateFixedPR(
      slackMember1.Slack_Id,
      newPR.url,
      [newPR],
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      json,
    );

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

    // Expect slack string to have specific information
    expect(slackString.includes(slackMember1.Slack_Name)).equal(true);
    expect(slackString.includes(newPR.url)).equal(true);
    expect(slackString.includes(slackMember2.Slack_Id)).equal(true);

    // Team queue should be up to date
    expect(teamQueue[0].url).equal(newPR.url);
    expect(teamQueue[0].owner).deep.equal(newPR.owner);
    expect(teamQueue[0].req_changes_leads_alert).deep.equal([]);
    expect(teamQueue[0].req_changes_members_alert).deep.equal([slackMember2.Slack_Id]);
    expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
    slackLead2.Slack_Id,
    slackLead3.Slack_Id]);
    expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3.Slack_Id]);
    expect(teamQueue[0].events[0].action).equal("OPENED");
    expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
    expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
    expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
    expect(teamQueue[0].events[2].action).equal("FIXED_PR");
    expect(teamQueue[0].events[2].user).deep.equal(slackMember1);

    // Expect PR Owner's queue to be empty
    expect(member1Queue).deep.equal([]);

    // Expect user who requested changes to be alerted
    expect(member2Queue).deep.equal(teamQueue);

    // Expect all other member queues to match team queue
    expect(member3Queue).deep.equal(teamQueue);

    // Expect all lead queues to match team queue
    expect(lead1Queue).deep.equal(teamQueue);
    expect(lead2Queue).deep.equal(teamQueue);
    expect(lead3Queue).deep.equal(teamQueue);
  });

  it("should update a PR when fixed by PR owner -- member & lead & lead req changes", async () => {
    json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
    const newPR = {
      owner: slackMember1,
      title: "VALID PR TITLE #1",
      url: "www.github.com/ethantpainter",
      standard_members_alert: [slackMember3.Slack_Id,
      slackMember2.Slack_Id,
      slackMember1.Slack_Id],
      members_approving: [],
      member_complete: false,
      standard_leads_alert: [slackLead2.Slack_Id,
      slackLead3.Slack_Id],
      leads_approving: [],
      lead_complete: false,
      leads_req_changes: [slackLead1.Slack_Id],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: slackMember1,
        action: "OPENED",
        time: "NOW",
      }, {
        user: slackLead1,
        action: "CHANGES_REQUESTED",
        time: "NEW NOW",
      }],
    };

    const slackString = await updateFixedPR(
      slackMember1.Slack_Id,
      newPR.url,
      [newPR],
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      json,
    );

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

    // Expect slack string to have specific information
    expect(slackString.includes(slackMember1.Slack_Name)).equal(true);
    expect(slackString.includes(newPR.url)).equal(true);
    expect(slackString.includes(slackLead1.Slack_Id)).equal(true);

    // Team queue should be up to date
    expect(teamQueue[0].url).equal(newPR.url);
    expect(teamQueue[0].owner).deep.equal(newPR.owner);
    expect(teamQueue[0].req_changes_leads_alert).deep.equal([slackLead1.Slack_Id]);
    expect(teamQueue[0].req_changes_members_alert).deep.equal([]);
    expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead2.Slack_Id,
    slackLead3.Slack_Id]);
    expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3.Slack_Id,
    slackMember2.Slack_Id]);
    expect(teamQueue[0].events[0].action).equal("OPENED");
    expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
    expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
    expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
    expect(teamQueue[0].events[2].action).equal("FIXED_PR");
    expect(teamQueue[0].events[2].user).deep.equal(slackMember1);

    // PR Owner queue should be empty
    expect(member1Queue).deep.equal([]);

    // Member queues should match team queue
    expect(member2Queue).deep.equal(teamQueue);
    expect(member3Queue).deep.equal(teamQueue);

    // Lead queues should match team queue
    expect(lead1Queue).deep.equal(teamQueue);
    expect(lead2Queue).deep.equal(teamQueue);
    expect(lead3Queue).deep.equal(teamQueue);
  });

});
