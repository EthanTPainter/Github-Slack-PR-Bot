export const json = {
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
          Dynamo_Member_Before_Lead: true,
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
              Slack_Id: "<SlackMemberId3",
            },
          },
        },
      },
    },
  },
};
