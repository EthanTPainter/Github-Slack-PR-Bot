import { getCheckMarkAlt } from "../../../../../src/slack/icons/check-mark";
import { getXMarkAlt } from "../../../../../src/slack/icons/x-mark";
import { SlackUser, TeamOptions } from "../../../../models";

/**
 * @description Construct string for Lead Approval statement
 * @param json JSON config file
 * @param leadsApproving Slack leads approving the PR
 * @param leadsReqChanges Slack leads requesting changes to the PR
 * @param leadsNotApproving Slack leads neither approving or requesting
 *                          changes to the PR
 * @param options TeamOptions model
 * @returns String of the Lead Approval for Slack message
 * @example Example:
 * 1 "1 Required Lead Approval: Dillon :CHECK:"
 * 2 "1 Required Lead Approval:  @Lead2 @Lead3 @Lead4"
 * 3 "2 Required Lead Approvals: Dillon :CHECK: Daniel :CHECK:"
 */
export function constructLeadCheck(
  json: any,
  leadsApproving: SlackUser[],
  leadsReqChanges: SlackUser[],
  leadsNotApproving: SlackUser[],
  options: TeamOptions,
): string {

  let leadCheck: string;
  if (options.Num_Required_Lead_Approvals === 0) {
    leadCheck = "0 Required Lead Approvals: ";
  }
  else if (options.Num_Required_Lead_Approvals === 1) {
    leadCheck = "1 Required Lead Approval: ";
  } else {
    leadCheck = `${options.Num_Required_Lead_Approvals} Required Lead Approvals: `;
  }

  // Format who has approved the PR thus far
  leadsApproving.map((slackLead: SlackUser) => {
    const checkMark = getCheckMarkAlt(slackLead, json);
    leadCheck += `${slackLead.Slack_Name} ${checkMark} `;
  });
  // Format who has requested changes to the PR thus far
  leadsReqChanges.map((slackLead: SlackUser) => {
    const xMark = getXMarkAlt(slackLead, json);
    leadCheck += `${slackLead.Slack_Name} ${xMark} `;
  });

  // Determine if current number of approving users
  // matches or exceeds the expected required Number
  if (leadsApproving.length + leadsReqChanges.length >=
    options.Num_Required_Lead_Approvals) {
    return leadCheck;
  }
  else {
    leadsNotApproving.map((slackLead: SlackUser) => {
      leadCheck += `${slackLead.Slack_Id} `;
    });
    return leadCheck;
  }
}
