export const json = {
  Department: {
    Dev: {
      Dev_Team_1: {
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
            GitHub_User_5: {
              Slack_Name: "Slack_user_5",
              Slack_Id: "<@SLACK_ID_5>",
            },
          },
        },
      },
      Dev_Team_2: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: "green",
          X_Mark_Text: "base",
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
        },
        Slack_Group: "Group Slack Name",
        Users: {
          Leads: {
            GitHub_User_1: {
              Slack_Name: "Slack_user_1",
              Slack_Id: "<@SLACK_ID_6>",
            },
          },
          Members: {
            GitHub_User_2: {
              Slack_Name: "Slack_user_2",
              Slack_Id: "<@SLACK_ID_7>",
            },
            GitHub_User_3: {
              Slack_Name: "Slack_user_3",
              Slack_Id: "<@SLACK_ID_8>",
            },
            GitHub_User_4: {
              Slack_Name: "Slack_user_4",
              Slack_Id: "<@SLACK_ID_9>",
            },
            GitHub_User_5: {
              Slack_Name: "Slack_user_5",
              Slack_Id: "<@SLACK_ID_10>",
            },
          },
        },
      },
    },
  },
};
