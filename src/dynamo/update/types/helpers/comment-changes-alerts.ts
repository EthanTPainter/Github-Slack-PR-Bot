import { PullRequest, SlackUser, JSONConfig } from "../../../../models";
import { DynamoGet, DynamoRemove } from "../../../api";
import {
  getSlackLeadsAlt,
  getSlackMembersAlt,
} from "../../../../json/parse/slack";

export async function processCommentingUserReqChanges(
  slackUserOwner: SlackUser,
  slackUserCommenting: SlackUser,
  pr: PullRequest,
  dynamoTableName: string,
  json: JSONConfig,
): Promise<void> {
  // Setup
  const dynamoGet = new DynamoGet();
  const dynamoRemove = new DynamoRemove();

  // If user commenting has previously requested changes and has not yet approved
  // Remove this PR from their queue. Update owner's queue
  // Avoid instances where owner is also the commenter
  if (pr.req_changes_leads_alert.includes(slackUserCommenting)
    && slackUserOwner.Slack_Id !== slackUserCommenting.Slack_Id) {
    // Remove slackUserCommenting from req_changes_leads_alert
    pr.req_changes_leads_alert = pr.req_changes_leads_alert.filter((lead: SlackUser) => {
      return lead !== slackUserCommenting;
    });
    // Determine if owner is a member or lead
    const slackMembers = getSlackMembersAlt(slackUserOwner, json);
    const slackMemberIds = slackMembers.map((member) => member.Slack_Id);
    const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
    const slackLeadsIds = slackLeads.map((lead) => lead.Slack_Id);
    // Update pr to alert owner if they're a member or lead
    if (slackMemberIds.includes(slackUserOwner.Slack_Id)) {
      // Verify Owner Id isn't already on members to alert
      const ownerAlreadyAlertedCheck = pr.standard_members_alert.includes(slackUserOwner);
      if (ownerAlreadyAlertedCheck === false) {
        pr.standard_members_alert.push(slackUserOwner);
      }
    }
    else if (slackLeadsIds.includes(slackUserOwner.Slack_Id)) {
      // Verify owner id isn't already on leads to alert
      const ownerAlreadyAlertedCheck = pr.standard_leads_alert.includes(slackUserOwner);
      if (ownerAlreadyAlertedCheck === false) {
        pr.standard_leads_alert.push(slackUserOwner);
      }
    }
    // Get slackUserCommenting's queue
    const userCommentingQueue = await dynamoGet.getQueue(
      dynamoTableName,
      slackUserCommenting,
    );
    // Remove PR from slackUserCommenting's queue
    await dynamoRemove.removePullRequest(
      dynamoTableName,
      slackUserCommenting.Slack_Id,
      userCommentingQueue,
      pr);
  }
  else if (pr.req_changes_members_alert.includes(slackUserCommenting)
    && slackUserOwner.Slack_Id !== slackUserCommenting.Slack_Id) {
    // Remove slackUserCommenting from req_changes_leads_alert
    pr.req_changes_members_alert = pr.req_changes_members_alert.filter((member: SlackUser) => {
      return member.Slack_Id !== slackUserCommenting.Slack_Id;
    });
    // Determine if owner is a member or lead
    const slackMembers = getSlackMembersAlt(slackUserOwner, json);
    const slackMemberIds = slackMembers.map((member) => member.Slack_Id);
    const slackLeads = getSlackLeadsAlt(slackUserOwner, json);
    const slackLeadsIds = slackLeads.map((lead) => lead.Slack_Id);
    // Update pr to alert owner if they're a member or lead
    if (slackMemberIds.includes(slackUserOwner.Slack_Id)) {
      // Verify Owner Id isn't already on members to alert
      const ownerAlreadyAlertedCheck = pr.standard_members_alert.includes(slackUserOwner);
      if (ownerAlreadyAlertedCheck === false) {
        pr.standard_members_alert.push(slackUserOwner);
      }
    }
    else if (slackLeadsIds.includes(slackUserOwner.Slack_Id)) {
      // Verify owner id isn't already on leads to alert
      const ownerAlreadyAlertedCheck = pr.standard_leads_alert.includes(slackUserOwner);
      if (ownerAlreadyAlertedCheck === false) {
        pr.standard_leads_alert.push(slackUserOwner);
      }
    }
    // Get slackUserCommenting's queue
    const userCommentingQueue = await dynamoGet.getQueue(
      dynamoTableName,
      slackUserCommenting,
    );
    // Remove PR from slackUserCommenting's queue
    await dynamoRemove.removePullRequest(
      dynamoTableName,
      slackUserCommenting.Slack_Id,
      userCommentingQueue,
      pr);
  }
}
