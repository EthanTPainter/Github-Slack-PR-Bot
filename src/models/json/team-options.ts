export type TeamOptions = {
  /* Time window (minutes) to prevent multiple alerts
   * for comments by the same user in a short period of time
   */ 
	Avoid_Comment_Alerts: number;

  // Text for check marks in Slack
	Check_Mark_Text: string;

  // Text for X mark in Slack
  X_Mark_Text: string;

  // Incldue Created DateTime
	Queue_Include_Created_Time: boolean;

  // Include Updated DateTime
	Queue_Include_Updated_Time: boolean;

  // Include Slack User names who approved PRs
	Queue_Include_Approval_Names: boolean;

  // Include Slack user names who request changes
	Queue_Include_Req_Changes_Names: boolean;

  // Include Owner of PR
	Queue_Include_Owner: boolean;

  // Put all Include information on a new line
	Queue_Include_New_Line: boolean;

  // Number of required member approvals
	Num_Required_Member_Approvals: number;

  // Number of required lead approvals
	Num_Required_Lead_Approvals: number;

  // Disable GitHub to Slack alerts
	Disable_GitHub_Alerts: boolean;

  /* If true, When adding new PR to dynamo queue,
	 * prioritize adding to member queues before lead queues
   * Adds to lead queues after fully member approved
    */
	Member_Before_Lead: boolean;
}
