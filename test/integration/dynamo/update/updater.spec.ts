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

  describe.only("open pr, request changes, fixed PR, approved", () => {
    // Expected use case
    it("member opens pr, member req changes, owner fixed pr, member approves -- 1 Req member approval",
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

    // Expected use case
    it("member opens pr, lead req changes, owner fixed pr, lead comments -- 1 Req lead approval",
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

    // Expected use case
    it("member opens pr, member req changes, owner fixed pr, member comments, member comments "
      + "-- 1 Req member approval", async () => {
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
        expect(teamQueue[0].standard_members_alert).deep.equal(slackMember1.Slack_Id);
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

    it.only("member opens pr, member req changes, owner fixed pr, member comments, member approves",
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
      });
  });
});
