import { getCheckMark } from "../../../icons/check-mark";
/**
 * @author Ethan T Painter
 * @description Construct string for Peer Approval statement
 * @param membersApproving Slack members approving the PR
 * @param membersNotApproving Slack members not approving the PR
 * @returns String of the Peer Approval in Slack message
 * @example Example:
 * 1 "2 Required Peer Approvals: Dillon :CHECK: Daniel :CHECK:"
 * 2 "2 Required Peer Approvals: Dillon :CHECK: @Peer2 @Peer3 @Peer4"
 * 3 "3 Required Peer Approvals: Dillon :CHECK: Daniel :CHECK: @Peer3 @Peer4"
 */
export function constructPeerCheck(json: any,
                                   membersApproving: string[],
                                   membersNotApproving: string[],
                                  ): any {
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
  // Format Who has approved the PR thus far
  membersApproving.forEach((slackMember: string) => {
    const checkMark = getCheckMark(json);
    peerCheck += `${slackMember} ${checkMark} `;
  });

  // Determine if current number of approving users
  // matches or exceeds the expected required Number
  if (membersApproving.length >= json.Options.Num_Required_Peer_Approvals) {
    return peerCheck;
  }
  else {
    membersNotApproving.forEach((slackMember: string) => {
      peerCheck += `@${slackMember} `;
    });
    return peerCheck;
  }
}
