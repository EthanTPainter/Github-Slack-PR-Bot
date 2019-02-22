import { Item } from "../../models";

/**
 * @description Filter PRs that are fully approved by Members
 * @param queue Queue containing all known PRs
 * @returns array of PRs that have been fully approved by PRs
 */
export function filterMemberApprovedPRs(queue: Item[]): Item[] {
  const memberApprovedPRs = queue.filter((memberApprovedPR: Item) => {
    return memberApprovedPR.member_complete === true
      && memberApprovedPR.lead_complete === false;
  });
  return memberApprovedPRs;
}
