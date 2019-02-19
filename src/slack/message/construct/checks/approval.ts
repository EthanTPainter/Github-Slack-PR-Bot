import { constructPeerCheck } from "./peer";
import { constructLeadCheck } from "./lead";
import { getApprovingReviews } from "../../../../../src/github/parse/reviews/get-reviews";

import {
  getMembersApproving,
  getMembersReqChanges,
  getMembersNotApproving,
  getLeadsApproving,
  getLeadsReqChanges,
  getLeadsNotApproving,
  getUsersApproving,
  getUsersNotApproving,
  getReqChangesReviews,
  getUsersReqChanges,
} from "../../../../github/parse";
import { SlackUser } from "../../../../models";

/**
 * @description Using all reviews for a PR, construct
 *              peer and lead review string statements
 * @param json JSON config file
 * @param slackOwner SlackUser who owns the PR
 * @param allReviews All reviews connected to the PR
 * @param slackMemberUsers All SlackUser members on the team
 * @param slackLeadUsers All SlackUser leads on the team
 * @example Example:
 * "2 Peer Approvals: Dillon :CHECK: @Peer2 @Peer3 @Peer4"
 * "1 Lead Approvals: @Lead1 @Lead2 @Lead3"
 */
export function getApprovalChecks(
  json: any,
  slackOwner: SlackUser,
  allReviews: any,
  slackMemberUsers: SlackUser[],
  slackLeadUsers: SlackUser[],
): string {

  // Record only approving reviews of the PR
  const approvingReviews = getApprovingReviews(allReviews);
  const requestingChangesReviews = getReqChangesReviews(allReviews);

  // Get Users approving, requesting changes, and not approving
  const usersApproving = getUsersApproving(approvingReviews, json);
  const usersRequestingChanges = getUsersReqChanges(requestingChangesReviews, json);
  const usersNotApproving = getUsersNotApproving(slackOwner, usersApproving,
    usersRequestingChanges, slackLeadUsers.concat(slackMemberUsers));

  // Separate users into members and leads
  // Get members approving, requesting changes, and none
  const membersApproving = getMembersApproving(usersApproving, slackMemberUsers);
  const membersReqChanges = getMembersReqChanges(usersRequestingChanges, slackMemberUsers);
  const membersNotApproving = getMembersNotApproving(usersNotApproving, slackMemberUsers);
  // Get leads approving, requesting changes, and none
  const leadsApproving = getLeadsApproving(usersApproving, slackLeadUsers);
  const leadsReqChanges = getLeadsReqChanges(usersRequestingChanges, slackLeadUsers);
  const leadsNotApproving = getLeadsNotApproving(usersNotApproving, slackLeadUsers);

  // Get Peer and Lead Approvals
  const peerApprovals = constructPeerCheck(json, membersApproving, membersReqChanges, membersNotApproving);
  const leadApprovals = constructLeadCheck(json, leadsApproving, leadsReqChanges, leadsNotApproving);
  return peerApprovals + "\n" + leadApprovals;
}
