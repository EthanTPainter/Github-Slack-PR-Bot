
export class TeamOptions {
  Avoid_Slack_Channel_Comment_Alerts_Time_Window: number;   // Time window when repetitive
                                                            // comments on a PR don't send alerts to Slack
  Check_Mark_Text: string;                // Text for check marks in Slack
  X_Mark_Text: string;                    // Text for X mark in Slack
  Queue_Include_Created_Time: boolean;    // Incldue Created DateTime
  Queue_Include_Updated_Time: boolean;    // Include Updated DateTime
  Queue_Include_Approval_Names: boolean;  // Include Slack User names who approved PRs
  Queue_Include_Owner: boolean;           // Include Owner of PR
  Queue_Include_New_Line: boolean;         // Put all Include information on a new line
  Num_Required_Member_Approvals: number;  // Number of required member approvals
  Num_Required_Lead_Approvals: number;    // Number of required lead approvals
  Disable_Dynamo: boolean;                // Disable Dynamo use
  Dynamo_Add_Member_Queue_Before_Lead: boolean; // If true, When adding new PR to dynamo queue,
                                                // prioritize adding to member queues before lead queues
                                                // Adds to lead queues after fully member approved
}
