import { DateTime } from "luxon";
import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove, DynamoUpdate } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import {
  getTeamOptionsAlt,
  getSlackLeadsAlt,
  getSlackMembersAlt,
  getSlackGroupAlt,
} from "../../../json/parse";

/**
 * @description Update a PR to include an approved user
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserApproving Slack user who approved the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event sent from the GitHub webhook
 * @param json JSON config file
 */
export async function updateApprove(
  slackUserOwner: SlackUser,
  slackUserApproving: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();
  const dynamoUpdate = new DynamoUpdate();
  let foundPR: any;

  // Get url from event
  const htmlUrl = getPRLink(event);

  // Get queue from slackUserApproving
  const dynamoQueue = await dynamoGet.getQueue(
    dynamoTableName,
    slackUserApproving.Slack_Id);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // Get PR from queue by matching PR html url
  foundPR = dynamoQueue.find((pr: PullRequest) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    // If not found in User's queue, check team queue
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`PR with url: ${htmlUrl} not found in ${slackUserApproving.Slack_Name}'s queue`);
    }
  }

  // Make timestamp for last updated time
  const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

  // Add new approve event from slackUserApproving
  const newEvent = {
    user: slackUserApproving,
    action: "APPROVED",
    time: currentTime,
  };
  foundPR.events.push(newEvent);

  // Get team options for # of required approvals
  const teamOptions = getTeamOptionsAlt(slackUserOwner, json);
  const reqLeadApprovals = teamOptions.Num_Required_Lead_Approvals;
  const reqMemberApprovals = teamOptions.Num_Required_Member_Approvals;

  // Determine if the slackUserApproving is a member or lead
  // If slackUserApproving is found as a lead & member, throw error
  const slackUserApprovingLeads = getSlackLeadsAlt(slackUserApproving, json);
  const slackUserApprovingMembers = getSlackMembersAlt(slackUserApproving, json);
  let foundLead = false;
  let foundMember = false;
  slackUserApprovingLeads.map((lead: SlackUser) => {
    if (lead.Slack_Id === slackUserApproving.Slack_Id) {
      foundLead = true;
    }
  });
  slackUserApprovingMembers.map((member: SlackUser) => {
    if (member.Slack_Id === slackUserApproving.Slack_Id) {
      foundMember = true;
    }
  });
  if (foundLead && foundMember) {
    throw new Error("slackUserApproving set as both a member and lead. Pick one!");
  }

  // Keep track of leads who no longer need to alerted
  const leftoverAlertedLeads: string[] = [];
  // If slackUserApproving is found as a lead
  if (foundLead) {
    // Append new approving lead & modify leads to alert
    foundPR.leads_approving.push(slackUserApproving.Slack_Id);
    if (foundPR.leads_approving.length >= reqLeadApprovals) {
      foundPR.leads_alert.map((slackId: string) => {
        // Store leftover leads and Reset leads_alert to []
        if (slackId !== slackUserApproving.Slack_Id) {
          leftoverAlertedLeads.push(slackId);
        }
      });
      foundPR.leads_alert = [];
      foundPR.lead_complete = true;
    }
    else {
      const newLeadsToAlert = foundPR.leads_alert.filter((slackId: string) => {
        return slackId !== slackUserApproving.Slack_Id;
      });
      foundPR.leads_alert = newLeadsToAlert;
    }
  }

  // Keep track of members who no longer need to alerted
  const leftoverAlertedMembers: string[] = [];
  // If slackUserApproving is found as a member
  if (foundMember) {
    // Append new approving lead & modify members to alert
    foundPR.members_approving.push(slackUserApproving.Slack_Id);
    if (foundPR.members_approving.length >= reqMemberApprovals) {
      // Store leftover mebers and reset members_alert to []
      foundPR.members_alert.map((slackId: string) => {
        if (slackId !== slackUserApproving.Slack_Id) {
          leftoverAlertedMembers.push(slackId);
        }
      });
      foundPR.members_alert = [];
      foundPR.member_complete = true;
      // If members before leads, created list for leads_alert
      if (teamOptions.Member_Before_Lead) {
        const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
        slackLeads.map((lead) => {
          foundPR.leads_alert.push(lead.Slack_Id);
        });
      }
    }
    else {
      const newMembersToAlert = foundPR.members_alert.filter((slackId: string) => {
        return slackId !== slackUserApproving.Slack_Id;
      });
      foundPR.members_alert = newMembersToAlert;
    }
  }

  // Update team queue
  await dynamoUpdate.updatePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);

  // Remove this PR from leftover users & slackUserApproving queues
  const removePRFromUsers = leftoverAlertedLeads.concat(leftoverAlertedMembers).concat(slackUserApproving.Slack_Id);
  await Promise.all(removePRFromUsers.map(async (removeUserId) => {
    const dynamoApproverQueue = await dynamoGet.getQueue(
      dynamoTableName,
      removeUserId);

    await dynamoRemove.removePullRequest(
      dynamoTableName,
      removeUserId,
      dynamoApproverQueue,
      foundPR);
  }));

  // Update all queues with members and leads to alert
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  await Promise.all(allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(
      dynamoTableName,
      alertUserId);

    await dynamoUpdate.updatePullRequest(
      dynamoTableName,
      alertUserId, currentQueue,
      foundPR);
  }));
}
