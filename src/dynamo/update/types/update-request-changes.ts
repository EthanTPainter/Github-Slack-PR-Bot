import { DynamoGet, DynamoAppend, DynamoUpdate, DynamoRemove } from "../../api";
import { getPRLink } from "../../../github/parse";
import { SlackUser, PullRequest } from "../../../models";
import { DateTime } from "luxon";
import {
  getSlackGroupAlt,
  getTeamOptionsAlt,
  getSlackLeadsAlt,
  getSlackMembersAlt,
} from "../../../json/parse";
import { updateLeadAlerts } from "./helpers/update-lead-alerts";
import { updateMemberAlerts } from "./helpers/update-member-alerts";

/**
 * @description Update PR to include changes requested
 * @param slackUserOwner Slack user who owns the PR
 * @param slackUserReqChanges Slack user who requested changes
 *                            to the PR
 * @param dynamoTableName Name of the dynamo table
 * @param event Event from the GitHub webhook
 * @param json JSON config file
 */
export async function updateReqChanges(
  slackUserOwner: SlackUser,
  slackUserReqChanges: SlackUser,
  dynamoTableName: string,
  event: any,
  json: any,
): Promise<void> {

  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoAppend = new DynamoAppend();
  const dynamoUpdate = new DynamoUpdate();
  const dynamoRemove = new DynamoRemove();
  let foundPR: any;

  // GitHub PR Url
  const htmlUrl = getPRLink(event);

  // Get PR from slackUserReqChanges's queue (matching GitHub URL)
  const dynamoQueue = await dynamoGet.getQueue(
    dynamoTableName,
    slackUserReqChanges.Slack_Id);

  // Team queue
  const ownerTeam = getSlackGroupAlt(slackUserOwner.Slack_Id, json);
  const teamQueue = await dynamoGet.getQueue(dynamoTableName, ownerTeam.Slack_Id);

  // Get PR from queue by matching PR html url
  foundPR = dynamoQueue.find((pr: PullRequest) => pr.url === htmlUrl);
  if (foundPR === undefined) {
    // If not found in user's queue, check team queue
    foundPR = teamQueue.find((pr) => pr.url === htmlUrl);
    if (foundPR === undefined) {
      throw new Error(`GitHub PR Url: ${htmlUrl} not found in any PRs in ${slackUserReqChanges.Slack_Name}'s queue`);
    }
  }

  // Make timestamp for last updated time
  const currentTime = DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

  // Add new changes requested event from slackUserReqChanges
  const newEvent = {
    user: slackUserReqChanges,
    action: "CHANGES_REQUESTED",
    time: currentTime,
  };
  foundPR.events.push(newEvent);

  // Get team options for # of required approvals
  const teamOptions = getTeamOptionsAlt(slackUserOwner, json);

  // Determine if the slack user requesting changes is a member or lead
  // If slackUserReqChanges is found as a lead & member, throw error
  const slackUserLeadsReqChanges = getSlackLeadsAlt(slackUserReqChanges, json);
  const slackUserMembersReqChanges = getSlackMembersAlt(slackUserReqChanges, json);
  let foundLead = false;
  let foundMember = false;
  slackUserLeadsReqChanges.map((lead) => {
    if (lead.Slack_Id === slackUserReqChanges.Slack_Id) {
      foundLead = true;
    }
  });
  slackUserMembersReqChanges.map((member) => {
    if (member.Slack_Id === slackUserReqChanges.Slack_Id) {
      foundMember = true;
    }
  });
  if (foundLead && foundMember) {
    throw new Error(`${slackUserReqChanges.Slack_Name} set as both a member and lead. Pick one`);
  }

  let leftoverAlertedLeads: string[] = [];
  let leftoverAlertedMembers: string[] = [];
  if (foundLead) {
    const result = await updateLeadAlerts(foundPR, slackUserOwner, slackUserReqChanges,
      teamOptions, false, dynamoTableName, json);
    foundPR = result.pr;
    leftoverAlertedLeads = result.leftLeads;
  }
  if (foundMember) {
    const result = await updateMemberAlerts(foundPR, slackUserOwner, slackUserReqChanges,
      teamOptions, false, dynamoTableName, json);
    foundPR = result.pr;
    leftoverAlertedMembers = result.leftMembers;
  }

  // Update team queue
  await dynamoUpdate.updatePullRequest(dynamoTableName, ownerTeam.Slack_Id, teamQueue, foundPR);

  // Remove PR from leftover users & user who request changes
  const removePRFromUsers = leftoverAlertedLeads.concat(leftoverAlertedMembers).concat(slackUserReqChanges.Slack_Id);
  await Promise.all(removePRFromUsers.map(async (removeUserId) => {
    const dynamoUserQueue = await dynamoGet.getQueue(
      dynamoTableName,
      removeUserId);

    await dynamoRemove.removePullRequest(
      dynamoTableName,
      removeUserId,
      dynamoUserQueue,
      foundPR);
  }));

  // Update all queues with members and leads to alert
  const allAlertingUserIds = foundPR.standard_leads_alert.concat(foundPR.standard_members_alert);
  await Promise.all(allAlertingUserIds.map(async (alertUserId: string) => {
    const currentQueue = await dynamoGet.getQueue(
      dynamoTableName,
      alertUserId);

    await dynamoUpdate.updatePullRequest(
      dynamoTableName,
      alertUserId,
      currentQueue,
      foundPR);
  }));

}
