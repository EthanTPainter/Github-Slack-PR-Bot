import { Item } from "../../models";
import { newLogger } from "../../logger";
import { filterMergablePRs } from "../filter/filter-mergable-prs";
import { filterLeadApprovedPRs } from "../filter/filter-lead-approved-prs";
import { filterMemberApprovedPRs } from "../filter/filter-member-approved-prs";
import { filterNoFullyApprovedPRs } from "../filter/filter-none-approved-prs";
import { constructQueueString } from "../../slack/message/construct/description";
import { getTeamOptionsAlt } from "../../json/parse";

const logger = newLogger("FormatTeamQueue");

/**
 * @description Format a queue from a raw DynamoDB stored
 * array into a stringified version to present on Slack
 * @param queue DynamoDB stored queue for a user
 * @param numReqMemberApprovals Number of required member approvals
 * @param numReqLeadApprovals Number of required lead approvals
 * @returns String of the DynamoDB queue contents
 */
export function formatTeamQueue(
  queue: Item[],
  json: any,
  ): string {
  let formattedQueue: string = "";

  // If the queue is empty
  if (queue.length === 0) {
    formattedQueue = `Nothing found in the team queue`;
    return formattedQueue;
  }

  // Filter out PRs into 4 main categories
  const mergablePRs = filterMergablePRs(queue);
  const onlyHasLeadApprovals = filterLeadApprovedPRs(queue);
  const onlyHasMemberApprovals = filterMemberApprovedPRs(queue);
  const needsBothApprovals = filterNoFullyApprovedPRs(queue);

  // Format the PRs into a stringified format
  // Don't format mergable PRs. They're already mergable
  if (mergablePRs.length > 0) {
    formattedQueue += "*Mergable PRs*\n";
  }
  mergablePRs.map((mergablePR: Item) => {
    const teamOptions = getTeamOptionsAlt(mergablePR.owner, json);
    formattedQueue += constructQueueString(mergablePR, teamOptions);
  });

  if (onlyHasMemberApprovals.length > 0) {
    formattedQueue += "*Needs Lead Approvals*\n";
  }
  // Sort onlyNeedsLeadApprovals by number of peers_approving
  const sortedMemberApprovals = onlyHasMemberApprovals.sort((a, b) => {
    return b.members_approving.length - a.members_approving.length;
  });
  sortedMemberApprovals.map((sortedMemberApproval: Item) => {
    const teamOptions = getTeamOptionsAlt(sortedMemberApproval.owner, json);
    formattedQueue += constructQueueString(sortedMemberApproval, teamOptions);
  });

  if (onlyHasLeadApprovals.length > 0) {
    formattedQueue += "*Needs Peer Approvals*\n";
  }
  // Sort onlyNeedsMemberApprovals by number of peers_approving
  const sortedLeadApprovals = onlyHasLeadApprovals.sort((a, b) => {
    return b.members_approving.length - a.members_approving.length;
  });
  sortedLeadApprovals.map((needLeadApprovalPR: Item) => {
    const teamOptions = getTeamOptionsAlt(needLeadApprovalPR.owner, json);
    formattedQueue += constructQueueString(needLeadApprovalPR, teamOptions);
  });

  if (needsBothApprovals.length > 0) {
    formattedQueue += "*Needs Peer and Lead Approvals*\n";
  }
  // Sort approvals by lead approvals (primary)
  // and sort this by peer approvals (secondary)
  const sortedNeedsBothApprovals = needsBothApprovals.sort((a, b) => {
    if (b.leads_approving.length === a.leads_approving.length) {
      return b.members_approving.length - a.members_approving.length;
    }
    return b.leads_approving.length - a.leads_approving.length;
  });
  sortedNeedsBothApprovals.map((needBothApprovalPR: Item) => {
    const teamOptions = getTeamOptionsAlt(needBothApprovalPR.owner, json);
    formattedQueue += constructQueueString(needBothApprovalPR, teamOptions);
  });

  return formattedQueue;
}
