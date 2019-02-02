import { getCheckMark } from "../../../../../src/slack/icons/check-mark";
import { getXMark } from "../../../../../src/slack/icons/x-mark";

/**
 * @author Ethan T Painter
 * @description Construct string for Lead Approval statement
 * @param leadsApproving Slack leads approving the PR
 * @param leadsNotApproving Slack leads not approving the PR
 * @returns String of the Lead Approval for Slack message
 * @example Example:
 * 1 "1 Required Lead Approval: Dillon :CHECK:"
 * 2 "1 Required Lead Approval:  @Lead2 @Lead3 @Lead4"
 * 3 "2 Required Lead Approvals: Dillon :CHECK: Daniel :CHECK:"
 */
export function constructLeadCheck(json: any,
                                   leadsApproving: string[],
                                   leadsReqChanges: string[],
                                   leadsNotApproving: string[],
                                  ): string
{
  if (json.Options.Num_Required_Lead_Approvals === undefined) {
    throw new Error("json.Option.Num_Required_Lead_Approvals is undefined");
  }
  let leadCheck: string;
  if (json.Options.Num_Required_Lead_Approvals === 0) {
    leadCheck = "0 Required Lead Approvals: ";
  }
  else if (json.Options.Num_Required_Lead_Approvals === 1) {
    leadCheck = "1 Required Lead Approval: ";
  } else {
    leadCheck = `${json.Options.Num_Required_Lead_Approvals} Required Lead Approvals: `;
  }

  // Format who has approved the PR thus far
  leadsApproving.forEach((slackLead: string) => {
    const checkMark = getCheckMark(json);
    leadCheck += `${slackLead} ${checkMark} `;
  });
  // Format who has requested changes to the PR thus far
  leadsReqChanges.forEach((slackLead: string) => {
    const xMark = getXMark(json);
    leadCheck += `${slackLead} ${xMark} `;
  });

  // Determine if current number of approving users
  // matches or exceeds the expected required Number
  if (leadsApproving.length + leadsReqChanges.length >=
        json.Options.Num_Required_Lead_Approvals) {
    return leadCheck;
  }
  else {
    leadsNotApproving.forEach((slackLead: string) => {
      leadCheck += `@${slackLead} `;
    });
    return leadCheck;
  }
}
