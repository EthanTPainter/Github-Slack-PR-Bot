import { SlackUser } from "../../../models";

/**
 * @description get all leads approving the PR
 * @param slackUsersApproving All slack users approving this PR
 * @param allSlackLeadUsers All slack lead users in the team
 * @returns All SlackUsers who are leads and approving the
 *          PR
 */
export function getLeadsApproving(
  slackUsersApproving: SlackUser[],
  allSlackLeadUsers: SlackUser[],
): SlackUser[] {
  const leadsApproving: SlackUser[] = [];
  slackUsersApproving.map((slackUser: SlackUser) => {
    allSlackLeadUsers.map((leadUser: SlackUser) => {
      if (leadUser.Slack_Name === slackUser.Slack_Name
          && leadUser.Slack_Id === slackUser.Slack_Id) {
            leadsApproving.push(leadUser);
      }
    });
  });
  return leadsApproving;
}

/**
 * @description get all leads requesting changes to PR
 * @param slackUsersReqChanges All slack leads requesting changes
 *                             to the PR
 * @param allSlackLeadUsers All slack lead users in the team
 * @returns All SlackUsers who are leads requesting changes
 *          to the PR
 */
export function getLeadsReqChanges(
  slackUsersReqChanges: SlackUser[],
  allSlackLeadUsers: SlackUser[],
): SlackUser[] {
  const leadsReqChanges: SlackUser[] = [];
  slackUsersReqChanges.map((slackUser: SlackUser) => {
    allSlackLeadUsers.map((leadUser: SlackUser) => {
      if (leadUser.Slack_Name === slackUser.Slack_Name
          && leadUser.Slack_Id === slackUser.Slack_Id) {
            leadsReqChanges.push(leadUser);
      }
    });
  });
  return leadsReqChanges;
}

/**
 * @description From all slack users not approving
 *              the PR, select the lead slack users
 *              not approving the PR.
 * @param slackUsersNotApproving list of all slack users not approving
 *                               the PR from a sub team (DevTeam1)
 * @param allSlackLeadUsers List of lead slack users for a team (DevTeam)
 * @returns List of lead SlackUsers not approving
 */
export function getLeadsNotApproving(
  slackUsersNotApproving: SlackUser[],
  allSlackLeadUsers: SlackUser[],
): SlackUser[] {
  const leadsNotApproving: SlackUser[] = [];
  slackUsersNotApproving.map((notApprovingUser: SlackUser) => {
    allSlackLeadUsers.map((leadUser: SlackUser) => {
      if (leadUser.Slack_Name === notApprovingUser.Slack_Name
          && leadUser.Slack_Id === notApprovingUser.Slack_Id) {
            leadsNotApproving.push(leadUser);
      }
    });
  });
  return leadsNotApproving;
}
