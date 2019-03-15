import { expect } from "chai";
import {
  updateMemberAlerts,
} from "../../../../../../src/dynamo/update/types/helpers/update-member-alerts";

describe("updateMemberAlerts", () => {

  let json: any;

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
              Disable_Dynamo: false,
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
  });

  // Req_Changes_Stop_Alerts = TRUE
  it("should update members given one approving member (1 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal([slackUserChanging.Slack_Id]);
    expect(result.pr.members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
  });

  it("should update members given one approving member (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one member requesting changes (1 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal([slackUserChanging.Slack_Id]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
  });

  it("should update members given one member requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given two approving members (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update members given two members requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal([slackUserOwner.Slack_Id]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update members given one approving, one requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>"]);
    expect(result.pr.members_alert).deep.equal([slackUserOwner.Slack_Id]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update memebers given one requesting changes, one approving (2 Req)", () => {
    const pr: any = {
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>"]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  // Req_Changes_Stop_Alerts = FALSE
  it("should update members given one approving member (1 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal([slackUserChanging.Slack_Id]);
    expect(result.pr.members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
  });

  it("should update members given one approving member (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>"]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one member requesting changes (1 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal([slackUserChanging.Slack_Id]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one member requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId3>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId3>", "<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given two approving members (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(true);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal([]);
    expect(result.pr.members_req_changes).deep.equal([]);

    expect(result.leftMembers).deep.equal(["<SlackMemberId4>"]);
  });

  it("should update members given two members requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>", "<SlackMemberId1>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal([]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>", "<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one approving, one requesting changes (2 Req)", () => {
    const pr: any = {
      members_req_changes: [],
      members_approving: ["<SlackMemberId3>"],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>", "<SlackMemberId1>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId3>"]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId2>"]);

    expect(result.leftMembers).deep.equal([]);
  });

  it("should update members given one requesting changes, one approving (2 Req)", () => {
    const pr: any = {
      members_req_changes: ["<SlackMemberId3>"],
      members_approving: [],
      members_alert: ["<SlackMemberId2>", "<SlackMemberId4>", "<SlackMemberId1>"],
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
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateMemberAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.member_complete).equal(false);
    expect(result.pr.members_approving).deep.equal(["<SlackMemberId2>"]);
    expect(result.pr.members_alert).deep.equal(["<SlackMemberId4>", "<SlackMemberId1>"]);
    expect(result.pr.members_req_changes).deep.equal(["<SlackMemberId3>"]);

    expect(result.leftMembers).deep.equal([]);
  });

});
