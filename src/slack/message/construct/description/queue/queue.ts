import { PullRequest, TeamOptions } from "../../../../../models";

/**
 * @description Construct a pr string given a pullRequest
 * @param pullRequest PullRequest model
 * @param options TeamOptions model
 * @returns string of the queue PR
 */
export function constructQueueString(
  pullRequest: PullRequest,
  options: TeamOptions,
): string {

  let prString = "";
  const includeCreatedTime = options.Queue_Include_Created_Time;
  const includeUpdatedTime = options.Queue_Include_Updated_Time;
  const includeApprovalNames = options.Queue_Include_Approval_Names;
  const includeReqChangesNames = options.Queue_Include_Req_Changes_Names;
  const includeOwner = options.Queue_Include_Owner;
  const includeNewLine = options.Queue_Include_New_Line;

  const createdDateTime = pullRequest.events[0].time;
  const updatedDateTime = pullRequest.events[pullRequest.events.length - 1].time;
  const leadsApproving = pullRequest.leads_approving;
  const membersApproving = pullRequest.members_approving;
  const leadsReqChanges = pullRequest.leads_req_changes;
  const membersReqChanges = pullRequest.members_req_changes;
  const owner = pullRequest.owner;
  const newLine = "\n\t";

  // PR String base
  prString = `${pullRequest.title} [${pullRequest.url}] `;

  // Add new line & indent
  if (includeNewLine) {
    prString += newLine;
  }

  // Add Lead & Member Approving
  if (includeApprovalNames) {
    // If there are leads approving, add to string
    if (leadsApproving.length > 0) {
      prString += `| Leads Approving: `;
      leadsApproving.map((leadApproving: string) => {
        prString += `[${leadApproving}] `;
      });
    }
    // If there are members approving, add to string
    if (membersApproving.length > 0) {
      prString += `| Members Approving: `;
      membersApproving.map((memberApproving: string) => {
        prString += `[${memberApproving}] `;
      });
    }
  }

  // Add Lead & Member requesting changes
  if (includeReqChangesNames) {
    // If there are leads, add to string
    if (leadsReqChanges.length > 0) {
      prString += `| Leads Request Changes: `;
      leadsReqChanges.map((leadReqChanges) => {
        prString += `[${leadReqChanges}] `;
      });
    }
    // If there are members, add to string
    if (membersReqChanges.length > 0) {
      prString += `| Members Request Changes: `;
      membersReqChanges.map((memberReqChanges) => {
        prString += `[${memberReqChanges}]`;
      });
    }
  }

  // Include Owner of the PR
  if (includeOwner) {
    prString += `| Owner: ${owner.Slack_Name} `;
  }

  // Include Created DateTime
  if (includeCreatedTime) {
    prString += `| Created: ${createdDateTime} `;
  }

  // Include Updated DateTime
  if (includeUpdatedTime) {
    prString += `| Updated: ${updatedDateTime} `;
  }

  // Append new line to prString after processing each option
  prString += "\n";

  return prString;
}
