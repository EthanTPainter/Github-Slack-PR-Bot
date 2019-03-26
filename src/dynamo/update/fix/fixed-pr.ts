import { PullRequest } from "../../../models";
import { getSlackUserAlt } from "../../../json/parse";

/**
 * @description Given a PR has user(s) requesting changes,
 * this updates queues and alerts people in Slack that the
 * PR is fixed
 * @param slackUserId Slack user's id
 * @param slackUserQueue Slack user's queue
 * @returns string of the expected slack message
 */
export function updateFixedPR(
  slackUserId: string,
  fixedPRUrl: string,
  slackUserQueue: PullRequest[],
  json: any,
): string {

  // Verify the PR is in the queue
  const foundPR = slackUserQueue.find((pr) => {
    return pr.url === fixedPRUrl;
  });
  if (!foundPR) {
    throw new Error(`Provided PR Url: ${fixedPRUrl}, not found in ${slackUserId} 's queue`);
  }

  // Get list of members & leads who requested changes
  const membersReqChanges = foundPR.members_req_changes;
  const leadsReqChanges = foundPR.leads_req_changes;
  const allUsersReqChanges = membersReqChanges.concat(leadsReqChanges);

  // Notify all members & leads who requested changes
  // that the PR is ready to review
  let allUsersString = "";
  allUsersReqChanges.map((user) => {
    allUsersString += `${user} `;
  });

  // Get Slack User from slackUserId & format final string
  const slackOwner = getSlackUserAlt(slackUserId, json);
  const fixedString = `${slackOwner.Slack_Name} has fixed PR: ${fixedPRUrl}. ${allUsersString}`;
  return fixedString;
}
