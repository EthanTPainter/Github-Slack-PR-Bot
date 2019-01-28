import { json } from "../../../../json/src/config";
import { constructPeerCheck } from "./peer";
import { constructLeadCheck } from "./lead";
import { getUsersApproving, getUsersNotApproving } from "src/github/parse";
import {
  getMembersApproving,
  getMembersNotApproving,
  getLeadsApproving,
  getLeadsNotApproving,
} from "src/github/parse/reviews/approve";

/**
 * @author Ethan T Painter
 * @description Using all reviews for a PR, construct
 *              peer and lead review string statements
 * @param allReviews All reviews connected to the PR
 * @example Example:
 * "2 Peer Approvals: Dillon :CHECK: @Peer2 @Peer3 @Peer4"
 * "1 Lead Approvals: @Lead1 @Lead2 @Lead3"
 */
export function getApprovalChecks(slackOwner: string,
                                  approvingReviews: any,
                                  slackMemberUsers: string[],
                                  slackLeadUsers: string[],
                                  ): string {
  // Get Users approving the PR
  const usersApproving: string[] = getUsersApproving(approvingReviews, json);
  const usersNotApproving = getUsersNotApproving(slackOwner, usersApproving,
      slackLeadUsers.concat(slackMemberUsers));

  // Separate users into members and leads
  const membersApproving = getMembersApproving(usersApproving, slackMemberUsers);
  const membersNotApproving = getMembersNotApproving(usersNotApproving, slackMemberUsers);
  const leadsApproving = getLeadsApproving(usersApproving, slackLeadUsers);
  const leadsNotApproving = getLeadsNotApproving(usersNotApproving, slackLeadUsers);

  // Get Peer and Lead Approvals
  const peerApprovals = constructPeerCheck(json, membersApproving, membersNotApproving);
  const leadApprovals = constructLeadCheck(json, leadsApproving, leadsNotApproving);
  return peerApprovals + "\n" + leadApprovals;
}
