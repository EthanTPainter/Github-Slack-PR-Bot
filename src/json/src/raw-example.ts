import { JSONConfig } from "../../../src/models";

export const json: JSONConfig = {
	Departments: {
		Dev: {
			Dev_Team_1: {
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
					Require_Fresh_Approvals: false,
					Fresh_Approval_Repositories: [],
				},
				Slack_Group: {
					Slack_Name: "TeamName1",
					Slack_Id: "<!subteam^ID|handle>",
				},
				Users: {
					Leads: {
						GitHub_Username_1: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_0>",
						},
					},
					Members: {
						GitHub_Username_2: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_1>",
						},
						GitHub_Username_3: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_2>",
						},
						GitHub_Username_4: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_3>",
						},
						GitHub_Username_5: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_4>",
						},
					},
				},
			},
			Dev_Team_2: {
				Options: {
					Avoid_Comment_Alerts: 5,
					Check_Mark_Text: ":happy:",
					X_Mark_Text: ":angry:",
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
					Require_Fresh_Approvals: false,
					Fresh_Approval_Repositories: [],
				},
				Slack_Group: {
					Slack_Name: "TeamName2",
					Slack_Id: "<!subteam^ID|handle>",
				},
				Users: {
					Leads: {
						GitHub_Username_1: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_0>",
						},
					},
					Members: {
						GitHub_Username_2: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_1>",
						},
						GitHub_Username_3: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_2>",
						},
						GitHub_Username_4: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_3>",
						},
						GitHub_Username_5: {
							Slack_Name: "FirstName LastName",
							Slack_Id: "<@ID_4>",
						},
					},
				},
			},
		},
	},
};
