import { expect } from "chai";
import {
  updateLeadAlerts,
} from "../../../../../../src/dynamo/update/types/helpers/update-lead-alerts";

describe("updateLeadAlerts", () => {

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
  it("should update leads given one approving lead (1 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 1,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([slackUserChanging.Slack_Id]);
    expect(result.pr.leads_alert).deep.equal([]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(true);

    expect(result.leftLeads).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>"]);
  });

  it("should update leads given one approving lead (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([slackUserChanging.Slack_Id]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>"]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given one lead requesting changes (1 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 1,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>"]);
  });

  it("should update leads given one lead requesting changes (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given two approving leads (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: ["<SlackLeadId2>"],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>", "<SlackLeadId3>"]);
    expect(result.pr.leads_alert).deep.equal([]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(true);

    expect(result.leftLeads).deep.equal(["<SlackLeadId4>"]);
  });

  it("should update leads given two leads requesting changes (2 Req)", () => {
    const pr: any = {
      leads_req_changes: ["<SlackLeadId2>"],
      leads_approving: [],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>", "<SlackLeadId3>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal(["<SlackLeadId4>"]);
  });

  it("should update leads given one approving, one requesting changes (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: ["<SlackLeadId2>"],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId3>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal(["<SlackLeadId4>"]);
  });

  it("should update leads given one requesting changes, one approving (2 Req)", () => {
    const pr: any = {
      leads_req_changes: ["<SlackLeadId2>"],
      leads_approving: [],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: true,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId3>"]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal(["<SlackLeadId4>"]);
  });

  // Req_Changes_Stop_Alerts = FALSE
  it("should update leads given one approving lead (1 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 1,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.leads_alert).deep.equal([]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(true);

    expect(result.leftLeads).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>"]);
  });

  it("should update leads given one approving lead (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>"]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given one lead requesting changes (1 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 1,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given one lead requesting changs (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: [],
      leads_alert: ["<SlackLeadId2>", "<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId2>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given two approving leads (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: ["<SlackLeadId2>"],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>", "<SlackLeadId3>"]);
    expect(result.pr.leads_alert).deep.equal([]);
    expect(result.pr.leads_req_changes).deep.equal([]);
    expect(result.pr.lead_complete).equal(true);

    expect(result.leftLeads).deep.equal(["<SlackLeadId4>"]);
  });

  it("should update leads given two leads requesting changes (2 Req)", () => {
    const pr: any = {
      leads_req_changes: ["<SlackLeadId2>"],
      leads_approving: [],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal([]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>", "<SlackLeadId3>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given one approving, one requesting changes (2 Req)", () => {
    const pr: any = {
      leads_req_changes: [],
      leads_approving: ["<SlackLeadId2>"],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = false;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId3>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

  it("should update leads given one requesting changes, one approving (2 Req)", () => {
    const pr: any = {
      leads_req_changes: ["<SlackLeadId2>"],
      leads_approving: [],
      leads_alert: ["<SlackLeadId3>", "<SlackLeadId4>", "<SlackLeadId1>"],
      lead_complete: false,
    };
    const slackUserOwner = {
      Slack_Id: "<SlackLeadId1>",
      Slack_Name: "SLACK LEAD 1",
    };
    const slackUserChanging = {
      Slack_Id: "<SlackLeadId3>",
      Slack_Name: "SlackName",
    };
    const teamOptions: any = {
      Num_Required_Lead_Approvals: 2,
      Req_Changes_Stop_Alerts: false,
    };
    const isApproving = true;

    const result = updateLeadAlerts(pr, slackUserOwner, slackUserChanging,
      teamOptions, isApproving, json);

    expect(result.pr.leads_approving).deep.equal(["<SlackLeadId3>"]);
    expect(result.pr.leads_alert).deep.equal(["<SlackLeadId4>", "<SlackLeadId1>"]);
    expect(result.pr.leads_req_changes).deep.equal(["<SlackLeadId2>"]);
    expect(result.pr.lead_complete).equal(false);

    expect(result.leftLeads).deep.equal([]);
  });

});
