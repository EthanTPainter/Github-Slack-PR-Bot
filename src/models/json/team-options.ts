
export type TeamOptions = {
  /* Time window (minutes) to prevent multiple alerts
   * for comments by the same user in a short period of time
   */ 
	Avoid_Comment_Alerts: number;

  // Text for check marks in Slack
  // Symbol used to suggest users who approved
	Check_Mark_Text: string;

  // Text for X mark in Slack
  // Symbol used to suggest users who requested changes
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

  // Put all "Include" information on a new line
	Queue_Include_New_Line: boolean;

  // Number of required member approvals
	Num_Required_Member_Approvals: number;

  // Number of required lead approvals
	Num_Required_Lead_Approvals: number;

  // Disable GitHub to Slack alerts
	Disable_GitHub_Alerts: boolean;

  /* If true:
   * When adding new PR to dynamo queue,
	 * prioritize adding to member queues before lead queues.
   * Also only alerts members until fully approved by members.
   * Adds to lead queues after fully member approved
   * 
   * If false:
   * Adds to both member and lead queues at the same time.
   * Alerts members and leads when changes are actively made.
   */
  Member_Before_Lead: boolean;
  
  /* Whether a team requires fresh approvals on repositories or not
   * Fresh Approval = An approval created on the latest commit
   * Stale Approval = An approval created on a commit older than the current commit
   * 
   * If true & Fresh_Approval_Repositories is an empty array:
   * Every PR the team creates must be freshly approved.
   * 
   * If true & Fresh_Approval_Repositories is not an empty array:
   * PRs created from listed repositories in Fresh_Approval_Repositories are required to have fresh approvals
   * PRs created from repositories not listed in Fresh_Approval_Repositories are not required to have fresh approvals
   * 
   * If false:
   * PRs created from ay repository 
   */
  Require_Fresh_Approvals: boolean;

  /*
   * A list of the names of repositories to enforce fresh approvals.
   * REQUIREMENTS: For this to be enforced, the option 'Require_Fresh_Approvals' must be set to true
   * 
   * If set to empty, requires fresh approvals on all repositories the team creates PRs in
   * If set to non empty, requires fresh approvals on any repositories that name is listed
   */
  Fresh_Approval_Repositories: string[];
}
