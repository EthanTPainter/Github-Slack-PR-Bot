import { Item } from "../../models";

export function filterLeadApprovedPRs(queue: Item[]): Item[] {
  const leadApprovedPRs = queue.filter((leadApprovedPR: Item) => {
    return leadApprovedPR.MemberComplete === false
      && leadApprovedPR.leadComplete === true;
  });
  return leadApprovedPRs;
}
