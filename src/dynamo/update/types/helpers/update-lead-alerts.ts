import {
  DynamoGet,
  DynamoRemove,
} from "../../../../../src/dynamo/api";
import {
  PullRequest,
  SlackUser,
  TeamOptions,
} from "../../../../models";
import {
  getSlackLeadsAlt,
  getSlackMembersAlt,
} from "../../../../json/parse";

/**
 * @description Update lead complete & leads to alert
 * @param pr Pull request to change
 * @param slackUserOwner Owner of the PR
 * @param slackUserChanging Slack user approving or
 *                  requesting changes to the PR
 * @param teamOptions Team options
 * @param isApproving boolean if the user is approving
 * @param json JSON config file
 * @returns a pull request with proper lead
 */
export async function updateLeadAlerts(
  pr: PullRequest,
  slackUserOwner: SlackUser,
  slackUserChanging: SlackUser,
  teamOptions: TeamOptions,
  isApproving: boolean,
  dynamoTableName: string,
  json: any,
): Promise<{ pr: PullRequest, leftLeads: string[] }> {
  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // Keep track of leads who no longer need to be alerted
  const leftoverAlertedLeads: string[] = [];

  // Determine whether to use # of users requesting changes to impact alerts
  let leadsReqChanges: string[] = [];
  leadsReqChanges = pr.leads_req_changes.concat(pr.req_changes_leads_alert);

  // If slackUserApproving is found as a lead
  if (isApproving) {
    // Filter out user from req_changes or req changes alerts
    pr.leads_req_changes = pr.leads_req_changes.filter((leadId) => {
      return leadId !== slackUserChanging.Slack_Id;
    });
    pr.req_changes_leads_alert = pr.req_changes_leads_alert.filter((leadId) => {
      return leadId !== slackUserChanging.Slack_Id;
    });
    // Check if there are any members or leads requesting changes to the PR
    // AND if the pr owner is in the standard member or leads alerted
    if (pr.leads_req_changes.length === 0
      && pr.members_req_changes.length === 0
      && pr.req_changes_leads_alert.length === 0
      && pr.req_changes_members_alert.length === 0
      && (pr.standard_leads_alert.includes(slackUserOwner.Slack_Id)
        || pr.standard_members_alert.includes(slackUserOwner.Slack_Id))) {
      pr.standard_leads_alert = pr.standard_leads_alert.filter((leadId) => {
        return leadId !== slackUserOwner.Slack_Id;
      });
      pr.standard_members_alert = pr.standard_members_alert.filter((memberId) => {
        return memberId !== slackUserOwner.Slack_Id;
      });
      // Remove slackUserOwner alerted in queue
      const ownerQueue = await dynamoGet.getQueue(
        dynamoTableName,
        slackUserOwner.Slack_Id);
      await dynamoRemove.removePullRequest(
        dynamoTableName,
        slackUserOwner.Slack_Id,
        ownerQueue,
        pr);
    }
    pr.leads_approving.push(slackUserChanging.Slack_Id);
  }
  else {
    pr.leads_req_changes.push(slackUserChanging.Slack_Id);
    // Check if slackUserOwner is a lead or member
    let ownerLead = false;
    let ownerMember = false;
    const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
    const slackMembers = getSlackMembersAlt(slackUserOwner, json);
    slackLeads.map((lead) => {
      if (lead.Slack_Id === slackUserOwner.Slack_Id) {
        ownerLead = true;
      }
    });
    slackMembers.map((member) => {
      if (member.Slack_Id === slackUserOwner.Slack_Id) {
        ownerMember = true;
      }
    });
    if (ownerLead && ownerMember) {
      throw new Error(`${slackUserOwner.Slack_Name} set as a member and lead. Pick one!`);
    }
    // Check if slackUserOwner is already in standard_leads_alert
    if (ownerLead) {
      if (!pr.standard_leads_alert.includes(slackUserOwner.Slack_Id)) {
        pr.standard_leads_alert.push(slackUserOwner.Slack_Id);
      }
    }
    // Check if slackUserOwner is already in standard_members_alert
    if (ownerMember) {
      if (!pr.standard_members_alert.includes(slackUserOwner.Slack_Id)) {
        pr.standard_members_alert.push(slackUserOwner.Slack_Id);
      }
    }
    // Check if slackUserChanging has preivously approved the PR
    // If found, remove lead from approving leads
    if (pr.leads_approving.includes(slackUserChanging.Slack_Id)) {
      pr.leads_approving = pr.leads_approving.filter((leadId) => {
        return leadId !== slackUserChanging.Slack_Id;
      });
    }
  }

  // If leads approving + leads requesting changes >= required
  // lead approvals then add slackId
  if (pr.leads_approving.length +
    pr.leads_req_changes.length +
    pr.req_changes_leads_alert.length
    >= teamOptions.Num_Required_Lead_Approvals) {
    pr.standard_leads_alert.map((slackId) => {
      // Store leftover leads and reset standard_leads_alert to []
      if (slackId !== slackUserChanging.Slack_Id
        && slackId !== slackUserOwner.Slack_Id) {
        leftoverAlertedLeads.push(slackId);
      }
    });
    // If leads alert includes pr owner, keep them alerted
    // Otherwise set to empty
    if (pr.standard_leads_alert.includes(slackUserOwner.Slack_Id)) {
      pr.standard_leads_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.standard_leads_alert = [];
    }
    if (pr.leads_approving.length < teamOptions.Num_Required_Lead_Approvals) {
      pr.lead_complete = false;
    } else {
      pr.lead_complete = true;
    }
  }
  // Otherwise, don't have enough leads approving/requesting changes
  // OR just approving. Construct new list of leads to alert
  else {
    const newLeadsToAlert = pr.standard_leads_alert.filter((slackId: string) => {
      return slackId !== slackUserChanging.Slack_Id;
    });
    pr.standard_leads_alert = newLeadsToAlert;
  }

  return { pr: pr, leftLeads: leftoverAlertedLeads };
}
