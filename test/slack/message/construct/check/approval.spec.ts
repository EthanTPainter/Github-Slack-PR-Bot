import { expect } from "chai";
import { getApprovalChecks } from "../../../../../src/slack/message/construct/checks/approval";

describe("getApprovalChecks", () => {

  const validJSON = {
    Options: {
      X_Mark_Style: "base",
      Check_Mark_Style: "green",
      Num_Required_Peer_Approvals: 1,
      Num_Required_Lead_Approvals: 1,
    },
    Departments: {
      Devs: {
        DevTeam1: {
          Slack_Group: {
            Slack_Name: "Group_Slack_Name",
            Slack_Id: "<@SLACK_ID>",
          },
          Users: {
            Leads: {
              GitHub_User_1: {
                Slack_Name: "Slack_user_1",
                Slack_Id: "<@SLACK_ID_1>",
              },
            },
            Members: {
              GitHub_User_2: {
                Slack_Name: "Slack_user_2",
                Slack_Id: "<@SLACK_ID_2>",
              },
              GitHub_User_3: {
                Slack_Name: "Slack_user_3",
                Slack_Id: "<@SLACK_ID_3>",
              },
              GitHub_User_4: {
                Slack_Name: "Slack_user_4",
                Slack_Id: "<@SLACK_ID_4>",
              },
            },
          },
        },
      },
    },
  };

  it("Should get approval status when no existing approving users", () => {
    const slackOwner = validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
    const allReviews = {
      GitHub_User_1: "COMMENTED",
    };
    const slackMemberUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Members);
    const slackLeadUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Leads);

    const result = getApprovalChecks(validJSON, slackOwner, allReviews, slackMemberUsers, slackLeadUsers);

    // PEER Check
    expect(result.includes(validJSON.Options.Num_Required_Peer_Approvals.toString())).to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_3.Slack_Id))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_4.Slack_Id))
      .to.be.equal(true);
    // LEAD Check
    expect(result.includes(validJSON.Options.Num_Required_Lead_Approvals.toString()))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1.Slack_Id))
      .to.be.equal(true);
  });

  it("Should get approval status with one approving peer user", () => {
    const slackOwner = validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
    const allReviews = {
      GitHub_User_3: "APPROVED",
    };
    const slackMemberUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Members);
    const slackLeadUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Leads);

    const result = getApprovalChecks(validJSON, slackOwner, allReviews, slackMemberUsers, slackLeadUsers);

    // PEER Check
    expect(result.includes(validJSON.Options.Num_Required_Peer_Approvals.toString()))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_3.Slack_Name))
      .to.be.equal(true);
    // LEAD Check
    expect(result.includes(validJSON.Options.Num_Required_Peer_Approvals.toString()))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1.Slack_Id))
      .to.be.equal(true);
  });

  it("Should get approval status with one approving peer and one approving lead", () => {
    const slackOwner = validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_2;
    const allReviews = {
      GitHub_User_1: "APPROVED",
      GitHub_User_4: "APPROVED",
    };
    const slackMemberUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Members);
    const slackLeadUsers = Object.values(validJSON.Departments.Devs.DevTeam1.Users.Leads);

    const result = getApprovalChecks(validJSON, slackOwner, allReviews, slackMemberUsers, slackLeadUsers);
    console.log("Result: ", result);

    // PEER Check
    expect(result.includes(validJSON.Options.Num_Required_Peer_Approvals.toString()))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Members.GitHub_User_4.Slack_Name))
      .to.be.equal(true);
    // LEAD Check
    expect(result.includes(validJSON.Options.Num_Required_Lead_Approvals.toString()))
      .to.be.equal(true);
    expect(result.includes(validJSON.Departments.Devs.DevTeam1.Users.Leads.GitHub_User_1.Slack_Name))
      .to.be.equal(true);
  });
});
