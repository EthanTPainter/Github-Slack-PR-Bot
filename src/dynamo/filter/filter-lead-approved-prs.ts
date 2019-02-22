import { Item } from "../../models";

export function filterLeadApprovedPRs(queue: Item[]): Item[] {
  const leadApprovedPRs = queue.filter((leadApprovedPR: Item) => {
    return leadApprovedPR.member_complete === false
      && leadApprovedPR.lead_complete === true;
  });
  return leadApprovedPRs;
}
