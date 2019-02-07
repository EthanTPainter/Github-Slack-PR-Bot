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
        Slack_Group: "<!subteam^ID|handle>",
        Users: {
          Leads: {
            GitHub_User_1: "<@ID_0>",
          },
          Members: {
            GitHub_User_2: "<@ID_1>",
            GitHub_User_3: "<@ID_2>",
            GitHub_User_4: "<@ID_3>",
            GitHub_User_5: "<@ID_4>",
          },
        },
      },
      Dev_Team_2: {
        Slack_Group: "<!subteam^ID|handle>",
        Users: {
          Leads: {
            GitHub_User_1: "<@ID_0>",
          },
          Members: {
            GitHub_User_2: "<@ID_1>",
            GitHub_User_3: "<@ID_2>",
            GitHub_User_4: "<@ID_3>",
            GitHub_User_5: "<@ID_4>",
          },
        },
      },
    },
  },
};
