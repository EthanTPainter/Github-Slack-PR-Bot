import { getCheckMarkAlt } from "../../../icons/check-mark";
import { getXMarkAlt } from "../../../icons/x-mark";
import { SlackUser, TeamOptions } from "../../../../models";

/**
 * @description Construct string for Member Approval statement
 * @param json JSON file for GitHub/Slack configuration settings
 *             and team groups
 * @param membersApproving Slack members approving the PR
 * @param membersReqChanges Slack members requesting changes to
 *                          the PR
 * @param membersNotApproving Slack members not approving the PR
 * @param options TeamOptions model to get required approvals for team
 * @returns String of the Member Approval in Slack message
 * @example Example:
 * 1 "2 Required Member Approvals: Dillon :CHECK: Daniel :CHECK:"
 * 2 "2 Required Member Approvals: Dillon :CHECK: @Member2 @Member3 @Member4"
 * 3 "3 Required Member Approvals: Dillon :CHECK: Daniel :CHECK: @Member3 @Member4"
 * 4 "2 Required Member Approvals: Dillon :CHECK: Daniel :X: @Member3 @Member4"
 */
export function constructMemberCheck(
  json: any,
  membersApproving: SlackUser[],
  membersReqChanges: SlackUser[],
  membersNotApproving: SlackUser[],
  options: TeamOptions,
): string {

  let memberCheck: string;
  // Format first segment of Member check statement
  if (options.Num_Required_Member_Approvals === 0) {
    memberCheck = "0 Required Member Approvals: ";
  }
  else if (options.Num_Required_Member_Approvals === 1) {
    memberCheck = "1 Required Member Approval: ";
  } else {
    memberCheck = `${options.Num_Required_Member_Approvals} Required Member Approvals: `;
  }

  // Format who has approved the PR thus far
  membersApproving.map((slackMember: SlackUser) => {
    const checkMark = getCheckMarkAlt(slackMember, json);
    memberCheck += `${slackMember.Slack_Name} ${checkMark} `;
  });
  // Format who has requested changed to the PR thus far
  membersReqChanges.map((slackMember: SlackUser) => {
    const xMark = getXMarkAlt(slackMember, json);
    memberCheck += `${slackMember.Slack_Name} ${xMark} `;
  });

  // Determine if current number of approving + requesting changes users
  // matches or exceeds the expected required number
  if (membersApproving.length + membersReqChanges.length >=
    options.Num_Required_Member_Approvals) {
      return memberCheck;
  }
  else {
    membersNotApproving.map((slackMember: SlackUser) => {
      memberCheck += `${slackMember.Slack_Id} `;
    });
    return memberCheck;
  }
}
