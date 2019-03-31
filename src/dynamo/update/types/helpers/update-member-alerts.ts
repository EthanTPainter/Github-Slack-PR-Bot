import { getSlackLeadsAlt, getSlackMembersAlt } from "../../../../json/parse";
import {
  PullRequest,
  SlackUser,
  TeamOptions,
} from "../../../../models";
import {
  DynamoGet,
  DynamoRemove,
} from "../../../api";

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
export async function updateMemberAlerts(
  pr: PullRequest,
  slackUserOwner: SlackUser,
  slackUserChanging: SlackUser,
  teamOptions: TeamOptions,
  isApproving: boolean,
  dynamoTableName: string,
  json: any,
): Promise<{ pr: PullRequest, leftMembers: string[] }> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // Keep track of members who no longer need to be alerted
  const leftoverAlertedMembers: string[] = [];

  if (isApproving) {
    // Check if the member requested changes
    if (pr.req_changes_members_alert.includes(slackUserChanging.Slack_Id)) {
      pr.req_changes_members_alert = pr.req_changes_members_alert.filter((memberId) => {
        return memberId !== slackUserChanging.Slack_Id;
      });
    }
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

  // AND members approving + members requesting changes >= required member approvals
  // Then add slackId
  if (pr.members_approving.length
    + pr.members_req_changes.length
    + pr.req_changes_members_alert.length
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
  // Otherwise don't have enough members approving/requesting changes
  // OR just approving. Construct new list of members to alert
  else {
    const newMembersToAlert = pr.standard_members_alert.filter((slackId) => {
      return slackId !== slackUserChanging.Slack_Id;
    });
    pr.standard_members_alert = newMembersToAlert;
  }

  return { pr: pr, leftMembers: leftoverAlertedMembers };
}
