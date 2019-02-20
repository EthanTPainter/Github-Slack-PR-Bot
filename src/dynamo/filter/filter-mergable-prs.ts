import { Item } from "../../models";

/**
 * @description Filter PRs that are currently mergable
 * @param queue Queue containing all known PRs
 * @returns array of PRs that are available to merge
 */
export function filterMergablePRs(queue: Item[]): Item[] {
  const mergablePRs = queue.filter((mergablePR: Item) => {
    return mergablePR.MemberComplete === true
      && mergablePR.leadComplete === true;
  });
  return mergablePRs;
}
