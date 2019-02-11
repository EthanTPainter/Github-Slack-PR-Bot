import { SlackUser } from "../../../../models";

/**
 * @author Ethan T Painter
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

  // Error checking
  if (json === undefined) {
    throw new Error("JSON file is undefined");
  }
  if (json.Options === undefined) {
    throw new Error("json.Options is undefined");
  }
  if (json.Options.Num_Required_Lead_Approvals === undefined) {
    throw new Error("json.Options.Num_Required_Lead_Approvals is undefined");
  }
  if (json.Options.Num_Required_Peer_Approvals === undefined) {
    throw new Error("json.Options.Num_Required_Peer_Approvals is undefined");
  }

  // Get required peer and lead reviews required
  const numRequiredPeerReviews = json.Options.Num_Required_Peer_Approvals;
  const numRequiredLeadReviews = json.Options.Num_Required_Lead_Approvals;

  if (slackUser.Slack_Name === undefined) {
    throw new Error("Slack_Name property not defined");
  }
  let desc: string = "";

  // new PR check
  // The *...* style means the ... is BOLD in Slack
  if (newPR) {
    desc = `${slackUser.Slack_Name} opened this PR. Needs *${numRequiredPeerReviews} peer*`
      + ` and *${numRequiredLeadReviews} lead* reviews`;
  } else {
    desc = `${slackUser.Slack_Name} reopened this PR. Needs *${numRequiredPeerReviews} peer*`
      + ` and *${numRequiredLeadReviews} lead* reviews`;
  }

  // Add SlackGroup
  desc = desc + ` ${slackGroup.Slack_Id}`;

  return desc;
}
