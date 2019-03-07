import { DateTime } from "luxon";
import { SlackUser, PullRequest } from "../../../models";
import { DynamoGet, DynamoRemove, DynamoUpdate } from "../../../dynamo/api";
import { getPRLink } from "../../../github/parse";
import {
  getTeamOptionsAlt,
  getSlackLeadsAlt,
  getSlackMembersAlt,
} from "../../../json/parse";
import { requiredEnvs } from "../../../required-envs";

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

  // Get url from event
  const htmlUrl = getPRLink(event);

  // Get queue from slackUserApproving
  const dynamoQueue = await dynamoGet.getQueue(
    dynamoTableName,
    slackUserApproving.Slack_Id);

  // Get PR from queue by matching PR html url
  const foundPR = dynamoQueue.find((pr: PullRequest) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    throw new Error(`PR with url: ${htmlUrl} not found in ${slackUserOwner.Slack_Name}'s queue`);
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
  const slackUserApprovingLeads = getSlackLeadsAlt(slackUserApproving, json);
  const slackUserApprovingMembers = getSlackMembersAlt(slackUserApproving, json);

  // Determine if the slackUserApproving is a lead or member
  let foundLead = false;
  let foundMember = true;
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

  // If slackUserApproving is found as a lead & member, throw error
  if (foundLead && foundMember) {
    throw new Error("slackUserApproving set as both a member and lead. Pick one!");
  }

  // If slackUserApproving is found as a lead
  if (foundLead) {
    // Append new approving lead & modify leads to alert
    foundPR.leads_approving.push(slackUserApproving.Slack_Id);
    if (foundPR.leads_approving.length >= reqLeadApprovals) {
      foundPR.leads_alert = [];
    }
    else {
      const newLeadsToAlert = foundPR.leads_alert.filter((slackId: string) => {
        return slackId !== slackUserApproving.Slack_Id;
      });
      foundPR.leads_alert = newLeadsToAlert;
    }
  }

  // If slackUserApproving is found as a member
  if (foundMember) {
    // Append new approving lead & modify leads to alert
    foundPR.members_approving.push(slackUserApproving.Slack_Id);
    if (foundPR.members_approving.length >= reqMemberApprovals) {
      foundPR.members_alert = [];
    }
    else {
      const newMembersToAlert = foundPR.members_alert.filter((slackId: string) => {
        return slackId !== slackUserApproving.Slack_Id;
      });
      foundPR.members_alert = newMembersToAlert;
    }
  }

  // Remove this PR from slackUserApproving's queue
  const dynamoApproverQueue = await dynamoGet.getQueue(
    dynamoTableName,
    slackUserApproving.Slack_Id);

  await dynamoRemove.removePullRequest(
    dynamoTableName,
    slackUserApproving.Slack_Id,
    dynamoApproverQueue,
    foundPR);

  // Update all queues with members and leads to alert
  const allAlertingUserIds = foundPR.leads_alert.concat(foundPR.members_alert);
  allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(
      dynamoTableName,
      alertUserId);

    await dynamoUpdate.updatePullRequest(
      dynamoTableName,
      alertUserId, currentQueue,
      foundPR);
  });
}
