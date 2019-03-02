import { PullRequest } from "../../models";

/**
 * @description Filter PRs that are fully approved by Members
 * @param queue Queue containing all known PRs
 * @returns array of PRs that have been fully approved by PRs
 */
export function filterMemberApprovedPRs(queue: PullRequest[]): PullRequest[] {
  const memberApprovedPRs = queue.filter((memberApprovedPR: PullRequest) => {
    return memberApprovedPR.member_complete === true
      && memberApprovedPR.lead_complete === false;
  });
  return memberApprovedPRs;
}
