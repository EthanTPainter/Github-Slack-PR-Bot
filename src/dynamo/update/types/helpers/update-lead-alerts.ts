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
export function updateLeadAlerts(
  pr: PullRequest,
  slackUserOwner: SlackUser,
  slackUserChanging: SlackUser,
  teamOptions: TeamOptions,
  isApproving: boolean,
  json: any,
): { pr: PullRequest, leftLeads: string[] } {

  // Keep track of leads who no longer need to be alerted
  const leftoverAlertedLeads: string[] = [];

  // Determine whether to use # of users requesting changes to impact alerts
  let leadsReqChanges: string[] = [];
  if (teamOptions.Req_Changes_Stop_Alerts) {
    leadsReqChanges = pr.leads_req_changes;
  } else {
    leadsReqChanges = [];
  }

  // If slackUserApproving is found as a lead
  if (isApproving) {
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
      throw new Error(`${slackUserOwner} set as a member and lead. Pick one!`);
    }
    // Check if slackUserOwner is already in leads_alert
    if (ownerLead) {
      if (!pr.leads_alert.includes(slackUserOwner.Slack_Id)) {
        pr.leads_alert.push(slackUserOwner.Slack_Id);
      }
    }
    if (ownerMember) {
      if (!pr.members_alert.includes(slackUserOwner.Slack_Id)) {
        pr.members_alert.push(slackUserOwner.Slack_Id);
      }
    }
  }

  // If users requesting changes stop alerts is TRUE
  // AND leads approving + leads requesting changes >= required lead approvals
  // Then add slackId
  if (teamOptions.Req_Changes_Stop_Alerts
    && pr.leads_approving.length + leadsReqChanges.length
    >= teamOptions.Num_Required_Lead_Approvals) {
    pr.leads_alert.map((slackId) => {
      // Store leftover leads and reset leads_alert to []
      if (slackId !== slackUserChanging.Slack_Id
          && slackId !== slackUserOwner.Slack_Id) {
        leftoverAlertedLeads.push(slackId);
      }
    });
    // If leads alert includes pr owner, keep them alerted
    // Otherwise set to empty
    if (pr.leads_alert.includes(slackUserOwner.Slack_Id)) {
      pr.leads_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.leads_alert = [];
    }
    if (pr.leads_approving.length < teamOptions.Num_Required_Lead_Approvals) {
      pr.lead_complete = false;
    } else {
      pr.lead_complete = true;
    }
  }
  // If users requesting changes to stop alerts is false
  // AND leads approving >= required leads approvals
  // Then add slackId
  else if (pr.leads_approving.length >= teamOptions.Num_Required_Lead_Approvals) {
    pr.leads_alert.map((slackId) => {
      // Store leftover leads and reset leads_alert to []
      if (slackId !== slackUserChanging.Slack_Id
        && slackId !== slackUserOwner.Slack_Id) {
        leftoverAlertedLeads.push(slackId);
      }
    });
    // If leads alert includes pr owner, keep them alerted
    // Otherwis set to empty
    if (pr.leads_alert.includes(slackUserOwner.Slack_Id)) {
      pr.leads_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.leads_alert = [];
    }
    // If there are leads requesting changes
    // even with other leads approving the PR
    // Consider the PR not lead complete
    if (pr.leads_req_changes.length > 0) {
      pr.lead_complete = false;
    } else {
      pr.lead_complete = true;
    }
  }
  // Otherwise, don't have enough leads approving/requesting changes
  // OR just approving. Construct new list of leads to alert
  else {
    const newLeadsToAlert = pr.leads_alert.filter((slackId: string) => {
      return slackId !== slackUserChanging.Slack_Id;
    });
    pr.leads_alert = newLeadsToAlert;
  }

  return { pr: pr, leftLeads: leftoverAlertedLeads };
}
