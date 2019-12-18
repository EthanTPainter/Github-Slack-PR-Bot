import * as sinon from "sinon";
import { expect } from "chai";
import { requiredEnvs } from "../../../../../../src/required-envs";
import { DynamoGet, DynamoRemove } from "../../../../../../src/dynamo/api";
import {
  updateMemberAlerts,
} from "../../../../../../src/dynamo/update/types/helpers/update-member-alerts";

describe("updateMemberAlerts", () => {

  let json: any;

  // Remove any interaction with temp databases in unit tests
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DevTeam1: {
            Options: {
              Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
              Check_Mark_Text: ":heavy_check_mark:",
              X_Mark_Text: ":X:",
              Include_Created_Time: true,
              Include_Updated_Time: true,
              Num_Required_Lead_Approvals: 1,
              Num_Required_Member_Approvals: 1,
              Member_Before_Lead: true,
            },
            Slack_Group: {
              Slack_Name: "SlackGroupName",
              Slack_Id: "<SlackGroupId>",
            },
            Users: {
              Leads: {
                GitHubLead1: {
                  Slack_Name: "SlackLeadName1",
                  Slack_Id: "<SlackLeadId1>",
                },
                GitHubLead2: {
                  Slack_Name: "SlackLeadName2",
                  Slack_Id: "<SlackLeadId2>",
                },
                GitHubLead3: {
                  Slack_Name: "SlackLeadName3",
                  Slack_Id: "<SlackLeadId3>",
                },
              },
              Members: {
                GitHubMember1: {
                  Slack_Name: "SlackMemberName1",
                  Slack_Id: "<SlackMemberId1>",
                },
                GitHubMember2: {
                  Slack_Name: "SlackMemberName2",
                  Slack_Id: "<SlackMemberId2>",
                },
                GitHubMember3: {
                  Slack_Name: "SlackMemberName3",
                  Slack_Id: "<SlackMemberId3>",
                },
              },
            },
          },
        },
      },
    };
    sandbox = sinon.createSandbox();
    sandbox.stub(dynamoGet, "getQueue").resolves();
    sandbox.stub(dynamoRemove, "removePullRequest").resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should update members given one approving member (1 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 1,
    };
    const isApproving = true;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal([slackUserChanging.Slack_Id]);
    expect(result.pr.standard_members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
  });

  it("should update members given one approving member (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = true;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.standard_members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one member requesting changes (1 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 1,
    };
    const isApproving = false;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.standard_members_alert).deep.equal(["<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal([slackUserChanging.Slack_Id]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
  });

  it("should update members given one member requesting changes (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = false;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.standard_members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given two approving members (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = true;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);
    expect(result.pr.standard_members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update members given two members requesting changes (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = false;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.standard_members_alert).deep.equal([slackUserOwner.Slack_Id]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update members given one approving, one requesting changes (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = false;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>"]);
    expect(result.pr.standard_members_alert).deep.equal([slackUserOwner.Slack_Id]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update memebers given one requesting changes, one approving (2 Req)", async () => {
    const pr: any = {
      req_changes_members_alert: [],
      req_changes_leads_alert: [],
      leads_req_changes: [],
      standard_leads_alert: [],
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      standard_members_alert: ["<SlackMemberId2>", "<SlackMemberId4>", "<SlackMemberId1>"],
      member_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackMemberId1>",
      Slack_Name: "SlackName",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackMemberId2>",
      Slack_Name: "Member2",
    };
    const teamOptions: any = {
      Num_Required_Member_Approvals: 2,
    };
    const isApproving = true;

    const result = await updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.standard_members_alert).deep.equal(["<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

});
