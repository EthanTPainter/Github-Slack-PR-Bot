import { Item } from "../../models";
import { newLogger } from "../../logger";
import { filterMergablePRs } from "../filter/filter-mergable-prs";
import { filterLeadApprovedPRs } from "../filter/filter-lead-approved-prs";
import { filterMemberApprovedPRs } from "../filter/filter-member-approved-prs";
import { filterNoFullyApprovedPRs } from "../filter/filter-none-approved-prs";

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
  numReqMemberApprovals: number,
  numReqLeadApprovals: number,
  ): string {
  let formattedQueue: string = "";

  // If the queue is empty
  if (queue.length === 0) {
    formattedQueue = "Nothing found in the team queue";
    return formattedQueue;
  }

  // Filter out PRs into 4 main categories
  const mergablePRs = filterMergablePRs(queue);
  const onlyNeedsLeadApprovals = filterLeadApprovedPRs(queue);
  const onlyNeedsMemberApprovals = filterMemberApprovedPRs(queue);
  const needsBothApprovals = filterNoFullyApprovedPRs(queue);

  // Format the PRs into a stringified format
  // Don't format mergable PRs. They're already mergable
  mergablePRs.map((mergablePR: Item) => {
    formattedQueue += mergablePR;
  });

  logger.info(`formattedQueue: ${formattedQueue}`);

  return formattedQueue;
}
