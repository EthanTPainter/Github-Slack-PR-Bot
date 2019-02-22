import { Item } from "../../models";

/**
 * @description Filter PRs that have not meet the required
 *              number of member approvals or lead approvals
 *              to statisfy either limit
 * @param queue Queue of PRs
 * @returns Array of PRs that do not meet or exceed the
 *          number of required approvals for Members or
 *          leads
 */
export function filterNoFullyApprovedPRs(queue: Item[]): Item[] {
  const noFullyApprovedPRs = queue.filter((notFullyApprovedPR: Item) => {
    return notFullyApprovedPR.member_complete === false
      && notFullyApprovedPR.lead_complete === false;
  });
  return noFullyApprovedPRs;
}
