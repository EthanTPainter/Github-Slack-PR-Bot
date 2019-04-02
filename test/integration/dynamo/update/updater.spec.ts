import { expect } from "chai";
import { json } from "../../json";
import { requiredEnvs } from "../../../../src/required-envs";
import {
  DynamoReset,
  DynamoGet,
} from "../../../../src/dynamo/api";
import {
  updateOpen,
  updateApprove,
  updateReqChanges,
  updateFixedPR,
  updateComment,
} from "../../../../src/dynamo/update";

describe("updater", () => {

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

  describe("open, req changes, fix, approve", () => {
    it("member1 opens pr, member2 req changes, owner fixed pr, member2 approves",
      async () => {
        json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
        await updateReqChanges(
          slackMember1,
          slackMember2,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        const m1Queue = await dynamoGet.getQueue(
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          slackMember1.Slack_Id,
        );
        await updateFixedPR(
          slackMember1.Slack_Id,
          event.pull_request.html_url,
          m1Queue,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          json);
        await updateApprove(
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
        expect(teamQueue[0].url).equal(event.pull_request.html_url);
        expect(teamQueue[0].title).equal(event.pull_request.title);
        expect(teamQueue[0].standard_members_alert).deep.equal([]);
        expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
        slackLead2.Slack_Id,
        slackLead3.Slack_Id]);
        expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
        expect(teamQueue[0].leads_approving).deep.equal([]);

        // PR Owner's queue should be empty
        expect(member1Queue).deep.equal([]);

        // Member queues should be empty
        expect(member2Queue).deep.equal([]);
        expect(member3Queue).deep.equal([]);

        // Leads queues should match team queue
        expect(lead1Queue).deep.equal(teamQueue);
        expect(lead2Queue).deep.equal(teamQueue);
        expect(lead3Queue).deep.equal(teamQueue);
      });
  });

  describe("open, req changes, fix, comments", () => {
    it("member1 opens pr, lead1 req changes, owner fixed pr, lead2 comments",
      async () => {
        json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
        await updateReqChanges(
          slackMember1,
          slackLead1,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        const l1Queue = await dynamoGet.getQueue(
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          slackMember1.Slack_Id,
        );
        await updateFixedPR(
          slackMember1.Slack_Id,
          event.pull_request.html_url,
          l1Queue,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          json);
        await updateComment(
          slackMember1,
          slackLead1,
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
        expect(teamQueue[0].url).equal(event.pull_request.html_url);
        expect(teamQueue[0].title).equal(event.pull_request.title);
        expect(teamQueue[0].standard_members_alert).deep.equal([slackMember2.Slack_Id,
        slackMember3.Slack_Id,
        slackMember1.Slack_Id]);
        expect(teamQueue[0].standard_leads_alert).deep.equal([]);
        expect(teamQueue[0].events[0].action).equal("OPENED");
        expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
        expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
        expect(teamQueue[0].events[1].user).deep.equal(slackLead1);
        expect(teamQueue[0].events[2].action).equal("FIXED_PR");
        expect(teamQueue[0].events[2].user).deep.equal(slackMember1);
        expect(teamQueue[0].events[3].action).equal("COMMENTED");
        expect(teamQueue[0].events[3].user).deep.equal(slackLead1);

        // PR Owner should be alerted after user requesting changes comments
        expect(member1Queue).deep.equal(teamQueue);

        // Expect all other member queues to match team queue
        expect(member2Queue).deep.equal(teamQueue);
        expect(member3Queue).deep.equal(teamQueue);

        // Lead queues should be empty
        expect(lead1Queue).deep.equal([]);
        expect(lead2Queue).deep.equal([]);
        expect(lead3Queue).deep.equal([]);
      });
  });

  describe("open, req changes, fix, comments, comments", () => {
    it("member1 opens pr, member2 req changes, owner fixed pr, member2 comments, member2 comments"
      , async () => {
        json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
        await updateReqChanges(
          slackMember1,
          slackMember2,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        const m1Queue = await dynamoGet.getQueue(
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          slackMember1.Slack_Id,
        );
        await updateFixedPR(
          slackMember1.Slack_Id,
          event.pull_request.html_url,
          m1Queue,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          json);
        await updateComment(
          slackMember1,
          slackMember2,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        await updateComment(
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
        expect(teamQueue[0].url).equal(event.pull_request.html_url);
        expect(teamQueue[0].title).equal(event.pull_request.title);
        expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
        expect(teamQueue[0].standard_leads_alert).deep.equal([]);
        expect(teamQueue[0].events[0].action).equal("OPENED");
        expect(teamQueue[0].events[0].user).deep.equal(slackMember1);
        expect(teamQueue[0].events[1].action).equal("CHANGES_REQUESTED");
        expect(teamQueue[0].events[1].user).deep.equal(slackMember2);
        expect(teamQueue[0].events[2].action).equal("FIXED_PR");
        expect(teamQueue[0].events[2].user).deep.equal(slackMember1);
        expect(teamQueue[0].events[3].action).equal("COMMENTED");
        expect(teamQueue[0].events[3].user).deep.equal(slackMember2);
        expect(teamQueue[0].events[4].action).equal("COMMENTED");
        expect(teamQueue[0].events[4].user).deep.equal(slackMember2);

        // PR Owner's queue should match team queue
        // User who requested changes commented after FIXED_PR
        expect(member1Queue).deep.equal(teamQueue);

        // Member queues should be empty
        expect(member2Queue).deep.equal([]);
        expect(member3Queue).deep.equal([]);

        // Lead queues should be empty
        expect(lead1Queue).deep.equal([]);
        expect(lead2Queue).deep.equal([]);
        expect(lead3Queue).deep.equal([]);
      });
  });

  describe("open, req changes, fix, comments, approve", () => {
    it("member1 opens pr, member2 req changes, owner fixed pr, member2 comments, member2 approves",
      async () => {
        json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
        await updateReqChanges(
          slackMember1,
          slackMember2,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        const m1Queue = await dynamoGet.getQueue(
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          slackMember1.Slack_Id,
        );
        await updateFixedPR(
          slackMember1.Slack_Id,
          event.pull_request.html_url,
          m1Queue,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          json);
        await updateComment(
          slackMember1,
          slackMember2,
          requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
          event,
          json);
        await updateApprove(
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
        expect(teamQueue[0].url).equal(event.pull_request.html_url);
        expect(teamQueue[0].title).equal(event.pull_request.title);
        expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
        expect(teamQueue[0].members_req_changes).deep.equal([]);
        expect(teamQueue[0].req_changes_members_alert).deep.equal([]);
        expect(teamQueue[0].standard_members_alert).deep.equal([]);
        expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
        slackLead2.Slack_Id,
        slackLead3.Slack_Id]);

        // Pr owner's queue should be empty
        expect(member1Queue).deep.equal([]);

        // All member queues should be empty
        expect(member2Queue).deep.equal([]);
        expect(member3Queue).deep.equal([]);

        // Lead queues should be up to date
        expect(lead1Queue).deep.equal(teamQueue);
        expect(lead2Queue).deep.equal(teamQueue);
        expect(lead3Queue).deep.equal(teamQueue);
      });
  });

  describe("open, req changes, approve", () => {
    // Member before lead
    it("member1 opens pr, member2 req changes, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
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
      expect(teamQueue[0].url).equal(event.pull_request.html_url);
      expect(teamQueue[0].title).equal(event.pull_request.title);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].members_req_changes).deep.equal([]);
      expect(teamQueue[0].req_changes_members_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);

      // PR Owner's queue should be empty
      expect(member1Queue).deep.equal([]);

      // Member queues should be empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues should match team queue
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, member2 req changes, member3 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
        slackMember1,
        slackMember3,
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
      expect(teamQueue[0].members_approving).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
      expect(teamQueue[0].member_complete).deep.equal(false);

      // PR owner's queue should match team queue
      expect(member1Queue).deep.equal(teamQueue);

      // All other member queues should be empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues should be empty
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    it("member1 open pr, lead1 req changes, member3 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
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
      await updateReqChanges(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
        slackMember1,
        slackMember3,
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
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].members_approving).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].leads_req_changes).deep.equal([slackLead1.Slack_Id]);

      // PR Owner's queue matches team queue
      expect(member1Queue).deep.equal(teamQueue);

      // All other member queues should be empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead1 should have an empty queue (req changes)
      expect(lead1Queue).deep.equal([]);

      // All other leads should match team queue
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, member2 req changes, lead3 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
        slackMember1,
        slackLead3,
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

      // Expect team queue to be up to date
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead3.Slack_Id]);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);

      // Expect PR owner to match team queue
      expect(member1Queue).deep.equal(teamQueue);

      // Expect member queues to be empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues should all be empty
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

  });

  describe("open, approve pr, req changes", () => {
    // Member before lead
    it("member1 opens pr, member2 approves, member2 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
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

      // Team queue
      expect(teamQueue[0].members_approving).deep.equal([]);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal(teamQueue);

      // All other member queues are empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues are empty
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    it("member1 opens pr, member2 approves, member3 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember3,
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

      // Team queue
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);

      // PR Owner queue
      expect(member1Queue).deep.equal(teamQueue);

      // All other member queues empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues should be empty
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    it("member1 opens pr, lead1 approves, member2 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
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

      // Team
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);

      // PR Owner
      expect(member1Queue).deep.equal(teamQueue);

      // Member queues empty
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    // Member & Lead
    it("member1 opens pr, member2 approves, member2 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_req_changes).deep.equal([]);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);

      // PR owner
      expect(member1Queue).deep.equal(teamQueue);

      // All other member queues
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, member2 approves, member3 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember3,
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);

      // PR Owner
      expect(member1Queue).deep.equal(teamQueue);

      // Member queues
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Lead queues
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, lead1 approves, member2 req changes", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
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

      // Team queue
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([]);
      expect(teamQueue[0].leads_req_changes).deep.equal([]);
      expect(teamQueue[0].members_req_changes).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember1.Slack_Id]);

      // PR Owner
      expect(member1Queue).deep.equal(teamQueue);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });
  });

  describe("open pr, comment, approve", () => {
    // Member before lead
    it("member1 opens pr, member2 comments, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateComment(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, member2 comments, member3 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateComment(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateApprove(
        slackMember1,
        slackMember3,
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });
  });

  describe("open pr, approve, req changes, fix, approve", () => {
    it("member1 opens pr, member2 aproves, member2 req changes, member1 fix, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead1.Slack_Id,
      slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal(teamQueue);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    it("member1 opens pr, member2 approves, member2 req changes, member1 fix, member3 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
        slackMember1,
        slackMember3,
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].members_approving).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].req_changes_members_alert).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal(teamQueue);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    it("member1 opens pr, member2 approves, member3 req changes, member1 fix, lead1 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember3,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
        slackMember1,
        slackLead1,
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

      // Team
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].req_changes_leads_alert).deep.equal([]);
      expect(teamQueue[0].req_changes_members_alert).deep.equal([slackMember3.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // Other Members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal(teamQueue);

      // Lead queues
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    // 1 Req Member, 1 Req Lead Approval
    it("member1 opens pr, lead1 approves, member2 req changes, member1 fix, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
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

      // Team
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });

    // 1 Req Member, 2 Req Lead Approvals
    it("member1 opens pr, lead1 approves, member2 req changes, member1 fix, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 1;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 2;
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
      await updateApprove(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
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

      // Team
      expect(teamQueue[0].lead_complete).equal(false);
      expect(teamQueue[0].member_complete).equal(true);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([slackLead2.Slack_Id,
      slackLead3.Slack_Id]);
      expect(teamQueue[0].standard_members_alert).deep.equal([]);

      // PR Owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal([]);

      // Leads
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal(teamQueue);
      expect(lead3Queue).deep.equal(teamQueue);
    });

    // 2 Req Member, 1 Req Lead Approval
    it("member opens pr, lead1 approves, member2 req changes, member1 fix, member2 approves", async () => {
      json.Departments.Devs.DevTeam1.Options.Num_Required_Member_Approvals = 2;
      json.Departments.Devs.DevTeam1.Options.Num_Required_Lead_Approvals = 1;
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
      await updateApprove(
        slackMember1,
        slackLead1,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      await updateReqChanges(
        slackMember1,
        slackMember2,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        event,
        json);
      const getm1Queue = await dynamoGet.getQueue(
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        slackMember1.Slack_Id,
      );
      await updateFixedPR(
        slackMember1.Slack_Id,
        event.pull_request.html_url,
        getm1Queue,
        requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
        json);
      await updateApprove(
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

      // Team
      expect(teamQueue[0].lead_complete).equal(true);
      expect(teamQueue[0].member_complete).equal(false);
      expect(teamQueue[0].leads_approving).deep.equal([slackLead1.Slack_Id]);
      expect(teamQueue[0].members_approving).deep.equal([slackMember2.Slack_Id]);
      expect(teamQueue[0].standard_leads_alert).deep.equal([]);
      expect(teamQueue[0].standard_members_alert).deep.equal([slackMember3.Slack_Id]);

      // PR owner
      expect(member1Queue).deep.equal([]);

      // All other members
      expect(member2Queue).deep.equal([]);
      expect(member3Queue).deep.equal(teamQueue);

      // Leads
      expect(lead1Queue).deep.equal([]);
      expect(lead2Queue).deep.equal([]);
      expect(lead3Queue).deep.equal([]);
    });
  });

});
