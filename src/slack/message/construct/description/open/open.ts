import { SlackUser } from "../../../../../models";
import { getTeamOptionsAlt } from "../../../../../json/parse";

/**
 * @description Construct the description of the slack message
 * @param slackUser Slack user to include in the description
 * @param slackGroup Slack group to include in the description
 * @param newPR Boolean to provide info if this a new PR or a
 *              reopened pr from a previously closed PR
 * @param json JSON config file (use for getting required reviews)
 * @returns String of the description for the slack message
 */
export function constructOpenDesc(
  slackUser: SlackUser,
  slackGroup: SlackUser,
  newPR: boolean,
  json: any,
): string {

  if (!json || json.Departments === undefined) {
    throw new Error("JSON is undefined");
  }
  const options = getTeamOptionsAlt(slackUser, json);

  // Get required Member and lead reviews required
  const numRequiredMemberReviews = options.Num_Required_Member_Approvals;
  const numRequiredLeadReviews = options.Num_Required_Lead_Approvals;
  let desc: string = "";

  // new PR check
  // The *...* style means the ... is BOLD in Slack
  if (newPR) {
    desc = `${slackUser.Slack_Name} opened this PR. Needs *${numRequiredMemberReviews} Member*`
      + ` and *${numRequiredLeadReviews} lead* reviews`;
  } else {
    desc = `${slackUser.Slack_Name} reopened this PR. Needs *${numRequiredMemberReviews} Member*`
      + ` and *${numRequiredLeadReviews} lead* reviews`;
  }

  // Add SlackGroup
  desc = desc + ` ${slackGroup.Slack_Id}`;

  return desc;
}