import { getCheckMark } from "../../../icons/check-mark";
import { getXMark } from "../../../icons/x-mark";

/**
 * @author Ethan T Painter
 * @description Construct string for Peer Approval statement
 * @param json JSON file for GitHub/Slack configuration settings
 *             and team groups
 * @param membersApproving Slack members approving the PR
 * @param membersReqChanges Slack members requesting changes to
 *                          the PR
 * @param membersNotApproving Slack members not approving the PR
 * @returns String of the Peer Approval in Slack message
 * @example Example:
 * 1 "2 Required Peer Approvals: Dillon :CHECK: Daniel :CHECK:"
 * 2 "2 Required Peer Approvals: Dillon :CHECK: @Peer2 @Peer3 @Peer4"
 * 3 "3 Required Peer Approvals: Dillon :CHECK: Daniel :CHECK: @Peer3 @Peer4"
 * 4 "2 Required Peer Approvals: Dillon :CHECK: Daniel :X: @Peer3 @Peer4"
 * 5 ""
 */
export function constructPeerCheck(
  json: any,
  membersApproving: string[],
  membersReqChanges: string[],
  membersNotApproving: string[],
): string {

  if (json.Options.Num_Required_Peer_Approvals === undefined) {
    throw new Error("json.Option.Num_Required_Peer_Approvals is undefined");
  }
  let peerCheck: string;
  // Format first segment of peer check statement
  if (json.Options.Num_Required_Peer_Approvals === 0) {
    peerCheck = "0 Required Peer Approvals: ";
  }
  else if (json.Options.Num_Required_Peer_Approvals === 1) {
    peerCheck = "1 Required Peer Approval: ";
  } else {
    peerCheck = `${json.Options.Num_Required_Peer_Approvals} Required Peer Approvals: `;
  }

  // Format who has approved the PR thus far
  membersApproving.forEach((slackMember: string) => {
    const checkMark = getCheckMark(json);
    peerCheck += `${slackMember} ${checkMark} `;
  });
  // Format who has requested changed to the PR thus far
  membersReqChanges.forEach((slackMember: string) => {
    const xMark = getXMark(json);
    peerCheck += `${slackMember} ${xMark} `;
  });

  // Determine if current number of approving + requesting changes users
  // matches or exceeds the expected required number
  if (membersApproving.length + membersReqChanges.length >=
    json.Options.Num_Required_Peer_Approvals) {
    return peerCheck;
  }
  else {
    membersNotApproving.forEach((slackMember: string) => {
      peerCheck += `@${slackMember} `;
    });
    return peerCheck;
  }
}
