import { getSlackLeadsAlt, getSlackMembersAlt } from "../../../../json/parse";
import {
  PullRequest,
  SlackUser,
  TeamOptions,
} from "../../../../models";

/**
 * @description Update member complete & members to alert
 * @param pr Pull request to change
 * @param slackUserOwner Slack user owner of the PR
 * @param slackUserChanging Slack user changing the status
 *                          of the PR by approving or
 *                          requesting changes
 * @param teamOptions Team Options
 * @param isApproving Whether the slackUserChanging is
 *                    approving the PR or requesting
 *                    changes
 * @param json JSON config file
 */
export function updateMemberAlerts(
  pr: PullRequest,
  slackUserOwner: SlackUser,
  slackUserChanging: SlackUser,
  teamOptions: TeamOptions,
  isApproving: boolean,
  json: any,
): { pr: PullRequest, leftMembers: string[] } {

  // Keep track of members who no longer need to be alerted
  const leftoverAlertedMembers: string[] = [];

  // Determine whether to use # of users requesting changes to impact alerts
  let membersReqChanges: string[] = [];
  if (teamOptions.Req_Changes_Stop_Alerts) {
    membersReqChanges = pr.members_req_changes;
  } else {
    membersReqChanges = [];
  }

  if (isApproving) {
    pr.members_approving.push(slackUserChanging.Slack_Id);
  } else {
    pr.members_req_changes.push(slackUserChanging.Slack_Id);
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
  }

  // If users requesting changes stop alerts is TRUE
  // AND members approving + members requesting changes >= required member approvals
  // Then add slackId
  if (teamOptions.Num_Required_Member_Approvals
    && pr.members_approving.length + membersReqChanges.length
    >= teamOptions.Num_Required_Member_Approvals) {
    // Store leftover members
    pr.standard_members_alert.map((slackId) => {
      if (slackId !== slackUserChanging.Slack_Id
        && slackId !== slackUserOwner.Slack_Id) {
        leftoverAlertedMembers.push(slackId);
      }
    });
    // If members alert includes pr owner, keep them alerted
    // Otherwise set to empty
    if (pr.standard_members_alert.includes(slackUserOwner.Slack_Id)) {
      pr.standard_members_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.standard_members_alert = [];
    }
    if (pr.members_approving.length < teamOptions.Num_Required_Member_Approvals) {
      pr.member_complete = false;
    } else {
      pr.member_complete = true;
      // If members before leads, created list for standard_leads_alert
      if (teamOptions.Member_Before_Lead) {
        const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
        slackLeads.map((lead) => {
          pr.standard_leads_alert.push(lead.Slack_Id);
        });
      }
    }
  }
  else if (pr.members_approving.length >= teamOptions.Num_Required_Member_Approvals) {
    pr.standard_members_alert.map((slackId) => {
      // Store leftover members and reset standard_members_alert to []
      if (slackId !== slackUserChanging.Slack_Id
        && slackId !== slackUserOwner.Slack_Id) {
        leftoverAlertedMembers.push(slackId);
      }
    });
    // If members alert includes pr owner, keep them alerted
    // Otherwise set to empty
    if (pr.standard_members_alert.includes(slackUserOwner.Slack_Id)) {
      pr.standard_members_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.standard_members_alert = [];
    }
    // If there are members requesting changes
    // even with other members approving the PR
    // Consider the PR not member complete
    if (pr.members_req_changes.length > 0) {
      pr.member_complete = false;
    } else {
      pr.member_complete = true;
    }
  }
  // Otherwise don't have enough memberss approving/requesting changes
  // OR just approving. Construct new list of members to alert
  else {
    const newMembersToAlert = pr.standard_members_alert.filter((slackId) => {
      return slackId !== slackUserChanging.Slack_Id;
    });
    pr.standard_members_alert = newMembersToAlert;
  }
  return { pr: pr, leftMembers: leftoverAlertedMembers };
}
