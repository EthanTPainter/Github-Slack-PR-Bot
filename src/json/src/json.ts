export const json = {
  Options: {
    Check_Mark_Style: "green",
    X_Mark_Style: "base",
    Num_Required_Lead_Approvals: 1,
    Num_Required_Peer_Approvals: 1,
    Allow_Cross_Sub_Team_Lead_Approvals: true,
    Allow_Cross_Sub_Team_Member_Approvals: true,
  },
  Teams: {
    Dev_Team: {
      Dev_Team_1: {
        Slack_Group: "Group_Slack_Name",
        Slack_Token: "TOKEN",
        Users: {
          Leads: {
            GitHub_User_1: "Slack_user_1",
          },
          Members: {
            GitHub_User_2: "Slack_user_2",
            GitHub_User_3: "Slack_user_3",
            GitHub_User_4: "Slack_user_4",
            GitHub_User_5: "Slack_user_5",
          },
        },
      },
      Dev_Team_2: {
        Slack_Group: "Group Slack Name",
        Slack_Token: "TOKEN",
        Users: {
          Leads: {
            GitHub_User_1: "Slack_user_1",
          },
          Members: {
            GitHub_User_2: "Slack_user_2",
            GitHub_User_3: "Slack_user_3",
            GitHub_User_4: "Slack_user_4",
            GitHub_User_5: "Slack_user_5",
          },
        },
      },
    },
  },
};