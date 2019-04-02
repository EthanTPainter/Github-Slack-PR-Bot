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
    // Filter out user from req_changes or req changes alerts
    pr.members_req_changes = pr.members_req_changes.filter((memberId) => {
      return memberId !== slackUserChanging.Slack_Id;
    });
    pr.req_changes_members_alert = pr.req_changes_members_alert.filter((memberId) => {
      return memberId !== slackUserChanging.Slack_Id;
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
    // Check if lead has preivously approved the PR
    // If found, remove lead from approving leads
    if (pr.members_approving.includes(slackUserChanging.Slack_Id)) {
      pr.members_approving = pr.members_approving.filter((memberId) => {
        return memberId !== slackUserChanging.Slack_Id;
      });
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
    // If members alert includes pr owner, keep owner alerted
    if (pr.standard_members_alert.includes(slackUserOwner.Slack_Id)) {
      pr.standard_members_alert = [slackUserOwner.Slack_Id];
    } else {
      pr.standard_members_alert = [];
    }
    // If any members are requesting changes, not member complete
    if (pr.req_changes_members_alert.length > 0 || pr.members_req_changes.length > 0) {
      // Check if leads were alerted after members complete were true
      if (teamOptions.Member_Before_Lead && pr.member_complete) {
        // Remove all standard leads alerted (except pr owner)
        const unalertedLeadIds: string[] = [];
        pr.standard_leads_alert = pr.standard_leads_alert.filter((leadId) => {
          if (leadId !== pr.owner.Slack_Id) {
            unalertedLeadIds.push(leadId);
          }
          return leadId === pr.owner.Slack_Id;
        });
        await Promise.all(unalertedLeadIds.map(async (unalertedLeadId) => {
          const currentQueue = await dynamoGet.getQueue(
            dynamoTableName,
            unalertedLeadId);
          await dynamoRemove.removePullRequest(
            dynamoTableName,
            unalertedLeadId,
            currentQueue,
            pr);
        }));
      }
      pr.member_complete = false;
    }
    else if (pr.members_approving.length < teamOptions.Num_Required_Member_Approvals) {
      pr.member_complete = false;
    } else {
      pr.member_complete = true;
      // If members before leads, created list for standard_leads_alert
      if (teamOptions.Member_Before_Lead) {
        // Check if leads are already complete
        if (pr.lead_complete === true) {
          // Do nothing
        }
        // If # of leads approving or requesting changes
        // meets or exceeds Required lead approvals
        else if (pr.leads_req_changes.length
          + pr.req_changes_leads_alert.length
          + pr.leads_approving.length
          > teamOptions.Num_Required_Lead_Approvals) {
            // Do nothing
        }
        // Otherwise can alert leads
        else {
          const currentApprovingLeads = pr.leads_approving;
          const currentReqChangesLeads = pr.leads_req_changes.concat(pr.req_changes_leads_alert);
          const allSlackLeads = getSlackLeadsAlt(slackUserOwner, json);
          allSlackLeads.map((lead) => {
            // Check if slackLead is already requesting changes or approving the PR
            if (currentApprovingLeads.includes(lead.Slack_Id)
              || currentReqChangesLeads.includes(lead.Slack_Id)) {
                // Do nothing
            }
            else {
              pr.standard_leads_alert.push(lead.Slack_Id);
            }
          });
        }
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
