import { JSONConfig } from "../../../src/models/json";

export const json: JSONConfig = {
	Departments: {
		Dev: {
			SCRIPTER: {
				Options: {
					Avoid_Comment_Alerts: 5,
					Check_Mark_Text: ":heavy_check_mark:",
					X_Mark_Text: ":X:",
					Queue_Include_Created_Time: true,
					Queue_Include_Updated_Time: true,
					Queue_Include_Approval_Names: true,
					Queue_Include_Req_Changes_Names: true,
					Queue_Include_Owner: true,
					Queue_Include_New_Line: true,
					Num_Required_Lead_Approvals: 0,
					Num_Required_Member_Approvals: 2,
					Member_Before_Lead: false,
					Disable_GitHub_Alerts: false,
				},
				Slack_Group: {
					Slack_Name: "Scripter Dev Team",
					Slack_Id: "<!subteam^SREAS7JCA|@scripter-dev-team>",
				},
				Users: {
					Leads: {
						evenflow58: {
							Slack_Name: "Evan",
							Slack_Id: "<@UH29FQUMN>",
            },
            ofolis: {
							Slack_Name: "Josh",
							Slack_Id: "<@U5CSJDH9Q>",
						},
					},
					Members: {
						dlarner3194: {
							Slack_Name: "Daniel",
							Slack_Id: "<@UBM5N8EGL>",
						},
						EthanTPainter: {
							Slack_Name: "Ethan",
							Slack_Id: "<@UB5EWEB3M>",
						},
						helwigmegan: {
							Slack_Name: "Megan",
							Slack_Id: "<@UH2DL9V7X>",
            },
            MarkFreedman: {
              Slack_Name: "Mark",
              Slack_Id: "<@UPU8KMUQH>",
            },
					},
				},
			},
			CONNECT: {
				Options: {
					Avoid_Comment_Alerts: 5,
					Check_Mark_Text: ":heavy_check_mark:",
					X_Mark_Text: ":X:",
					Queue_Include_Created_Time: true,
					Queue_Include_Updated_Time: true,
					Queue_Include_Approval_Names: true,
					Queue_Include_Req_Changes_Names: true,
					Queue_Include_Owner: true,
					Queue_Include_New_Line: false,
					Num_Required_Lead_Approvals: 1,
					Num_Required_Member_Approvals: 1,
					Member_Before_Lead: true,
					Disable_GitHub_Alerts: false,
				},
				Slack_Group: {
					Slack_Name: "Connect Team",
					Slack_Id: "<!subteam^SRFMK0W8K|@connect-team>",
				},
				Users: {
					Leads: {
						dinkzilla: {
							Slack_Name: "Matt",
							Slack_Id: "<@UBDE41BK6>",
            },
            "bgidwani-dgdean": {
              Slack_Name: "Bharat",
              Slack_Id: "<@UPFQ8CMG8>",
            },
					},
					Members: {
						DillonSykes: {
							Slack_Name: "Dillon",
							Slack_Id: "<@UBNT2JKRQ>",
						},
						crewsha: {
							Slack_Name: "Harrison",
							Slack_Id: "<@UCZGFLHS8>",
            },
            stam999: {
              Slack_Name: "Stan",
              Slack_Id: "<@UQ268G3DK>",
            },
            myakubdgdean: {
              Slack_Name: "Mike",
              Slack_Id: "<@UL74V8GTC>",
            },
					},
				},
			},
		},
	},
};
