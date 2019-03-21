import { expect } from "chai";
import { json } from "../../json";
import { requiredEnvs } from "../../../../src/required-envs";
import {
  DynamoReset,
  DynamoGet,
} from "../../../../src/dynamo/api";
import {
  updateOpen,
} from "../../../../src/dynamo/update";

describe.only("updater", () => {

  const dynamoReset = new DynamoReset();
  const dynamoGet = new DynamoGet();

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

  describe.only("open pr", () => {
    it("lead open pr -- member before lead", async () => {
      json.Departments.Devs.DevTeam1.Options.Req_Changes_Stop_Alerts = true;
      json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
      const event = {
        pull_request: {
          title: "NEW TITLE",
          html_url: "www.github.com/EthanTPainter",
        },
      };

      await updateOpen(
        slackLead1,
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

      // Team queue should be up to date
      expect(teamQueue[0].url).deep.equal(event.pull_request.html_url);
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_alert).deep.equal([]);
      expect(teamQueue[0].members_alert).deep.equal([slackMember1.Slack_Id,
      slackMember2.Slack_Id,
      slackMember3.Slack_Id,
      ]);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([]);

      // Expect PR Owner to have an empty queue
      expect(lead1Queue).deep.equal([]);

      // Lead 2, 3, etc. queues should be empty
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);

      // All member queues should match team queue
      expect(member1Queue).deep.equal(teamQueue);
      expect(member2Queue).deep.equal(teamQueue);
      expect(member3Queue).deep.equal(teamQueue);
    });

    it("lead open pr -- member & lead", async () => {
      json.Departments.Devs.DevTeam1.Options.Req_Changes_Stop_Alerts = true;
      json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
      const event = {
        pull_request: {
          title: "NEW TITLE",
          html_url: "www.github.com/EthanTPainter",
        },
      };

      await updateOpen(
        slackLead1,
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

      // Team queue should be up to date
      expect(teamQueue[0].url).deep.equal(event.pull_request.html_url);
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_alert).deep.equal([slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].members_alert).deep.equal([slackMember1.Slack_Id,
      slackMember2.Slack_Id,
      slackMember3.Slack_Id,
      ]);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([]);

      // Expect PR Owner to have an empty queue
      expect(lead1Queue).deep.equal([]);

      // Lead 2, 3, etc. queues should match team queue
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);

      // All member queues should match team queue
      expect(member1Queue).deep.equal(teamQueue);
      expect(member2Queue).deep.equal(teamQueue);
      expect(member3Queue).deep.equal(teamQueue);
    });

    it("member open pr -- member before lead", async () => {
      json.Departments.Devs.DevTeam1.Options.Req_Changes_Stop_Alerts = true;
      json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = true;
      const event = {
        pull_request: {
          title: "NEW TITLE",
          html_url: "www.github.com/EthanTPainter",
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

      // Team queue should be up to date
      expect(teamQueue[0].url).deep.equal(event.pull_request.html_url);
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_alert).deep.equal([]);
      expect(teamQueue[0].members_alert).deep.equal([slackMember2.Slack_Id,
      slackMember3.Slack_Id,
      ]);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([]);

      expect(member1Queue).deep.equal([]);

      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);

      expect(member2Queue).deep.equal(teamQueue);
      expect(member3Queue).deep.equal(teamQueue);
    });

    it("member open pr -- member & lead", async () => {
      json.Departments.Devs.DevTeam1.Options.Req_Changes_Stop_Alerts = true;
      json.Departments.Devs.DevTeam1.Options.Member_Before_Lead = false;
      const event = {
        pull_request: {
          title: "NEW TITLE",
          html_url: "www.github.com/EthanTPainter",
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

      // Team queue should be up to date
      expect(teamQueue[0].url).deep.equal(event.pull_request.html_url);
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].members_alert).deep.equal([slackMember2.Slack_Id,
      slackMember3.Slack_Id,
      ]);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([]);

      expect(member1Queue).deep.equal([]);

      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);

      expect(member2Queue).deep.equal(teamQueue);
      expect(member3Queue).deep.equal(teamQueue);
    });
  });

  describe("open pr & approve pr", () => {
    // Open & approve
    it("lead open pr, lead approve pr -- member before lead", () => {

    });

    it("lead open pr, member approve pr -- member before lead", () => {

    });

    it("lead open pr, lead approve pr -- member & lead", () => {

    });

    it("lead open pr, member approve pr -- member & lead", () => {

    });

    it("member open pr, lead approve pr -- member before lead", () => {

    });

    it("member open pr, member approve pr -- member before lead", () => {

    });

    it("member open pr, member approve pr -- member & lead", () => {

    });

    it("member open pr, member approve pr -- member & lead", () => {

    });
  });

  describe("open pr & request changes to pr", () => {
    // Open & request changes
    it("lead open pr, lead req changes pr -- member before lead", () => {

    });

    it("lead open pr, member req changes pr -- member before lead", () => {

    });

    it("lead open pr, lead req changes pr -- member & lead", () => {

    });

    it("lead open pr, member req changes pr -- member & lead", () => {

    });

    it("member open pr, lead req changes pr -- member before lead", () => {

    });

    it("member open pr, member req changes pr -- member before lead", () => {

    });

    it("member open pr, member req changes pr -- member & lead", () => {

    });

    it("member open pr, member req changes pr -- member & lead", () => {

    });
  });

  describe("open pr & comment on pr", () => {
  });

  describe("open pr & close pr", () => {
  });

  describe("open pr & merge pr", () => {
  });

  describe("open pr, approve pr, & approve pr", () => {
  });

  describe("open pr, approve pr, & request changes to pr", () => {
  });

  describe("open pr, approve pr, & comment on pr", () => {
  });

  describe("open pr, approve pr, & close pr", () => {
  });

  describe("open pr, approve pr, & merge pr", () => {
  });

  describe("open pr, comment on pr, & comment on pr", () => {
  });

  describe("open pr, comment on pr, & approve pr", () => {
  });

  describe("open pr, comment on pr, & request change on pr", () => {
  });

});
