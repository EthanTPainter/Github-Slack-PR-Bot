import { SlackUser } from "../../../../../models";

/**
 * @description Function used to construct the description
 * @param slackUser Slack user who owns the PR
 * @param slackUserApproving Slack user who is approving the PR
 * @returns string of the description for the Slack Message
 */
export function constructApproveDesc(
  slackUser: SlackUser,
  slackUserApproving: SlackUser,
): string {

  // Error Handling
  if (slackUser.Slack_Name === undefined
    || slackUser.Slack_Id === undefined) {
    throw new Error("slackUser properties undefined");
  }
  if (slackUserApproving.Slack_Name === undefined
    || slackUserApproving.Slack_Id === undefined) {
    throw new Error("slackUserApproving properties undefined");
  }
  const desc = `${slackUserApproving.Slack_Name} has approved this PR. Owner: ${slackUser.Slack_Id}`;
  return desc;
}

/**
 * @description Generate a list of members to @ in Slack.
 *              Will be none, [], if the only member has
 *              already approve it.
 * @param members Members in a team
 * @param membersExempt Members exempt from being At'ed (@) in Slack
 *        since they're already involved in owning/approving the PR
 * @returns String[] of members to @ in Slack
 */
export function getMemberList(
  members: string[],
  membersExempt: string[],
): string[] {

  const group: string[] = [];
  let counter: number = 0;
  // Loop through members. If a member is in membersExempt
  // don't add them to group (they're exempt). Otherwise, add them.
  if (members.length === 0) {
    throw new Error("No team members found");
  }
  // Loop through members
  while (counter < members.length) {
    let exemptCounter: number = 0;
    let found: boolean = false;
    // Loop through membersExempt
    while (exemptCounter < membersExempt.length) {
      if (members[counter] === membersExempt[exemptCounter]) {
        found = true;
      }
      exemptCounter++;
    }
    // After looping through members Exempt once
    // If found is true, don't add to group
    // If found is false, add to group
    if (found === false) {
      group.push(members[counter]);
    }
    counter++;
  }
  return group;
}

/**
 * @description Get list of leads to @ in Slack.
 *        Will be none, [], if the only lead has
 *         already approved it.
 * @param leads Leads in a team
 * @param leadsExempt Leads exempt from being At'ed (@) in Slack
 *        since they're already invovled in owning/approving the PR
 */
export function getLeadList(
  leads: string[],
  leadsExempt: string[],
): string[] {
  const group: string[] = [];
  let counter: number = 0;
  // Loop through leads. If a lead is in leadsExempt
  // don't add them to group (they're exempt). Otherwise, add them
  if (leads.length === 0) {
    throw new Error("No team leads found");
  }
  // Loop through members
  while (counter < leads.length) {
    let exemptCounter: number = 0;
    let found: boolean = false;
    // Loop through leadsExempt
    while (exemptCounter < leadsExempt.length) {
      if (leads[counter] === leadsExempt[exemptCounter]) {
        found = true;
      }
      exemptCounter++;
    }
    // After looping through members Exempt once
    // If found is true, don't add to group
    // If found is false, add to group
    if (found === false) {
      group.push(leads[counter]);
    }
    counter++;
  }
  return group;
}
