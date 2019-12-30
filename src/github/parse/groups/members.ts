import { SlackUser } from "../../../models";

/**
 * @description Get all SlackUser members approving the PR
 * @param slackUsersApproving all SlackUsers approving the PR
 * @param slackMemberUsers All SlackUser members on the team
 * @returns List of member slack users approving. Intersection
 *          of slackUsersApproving and slackMemberUsers
 */
export function getMembersApproving(
  slackUsersApproving: SlackUser[],
  slackMemberUsers: SlackUser[],
): SlackUser[] {
  const membersApproving: SlackUser[] = [];
  slackUsersApproving.forEach((slackUserApproving: SlackUser) => {
    slackMemberUsers.forEach((slackMember: SlackUser) => {
      if (slackMember.Slack_Name === slackUserApproving.Slack_Name
        && slackMember.Slack_Id === slackUserApproving.Slack_Id) {
          membersApproving.push(slackMember);
      }
    });
  });
  return membersApproving;
}

/**
 * @description Get all slack members requesting changes
 * @param slackUsersReqChanges SlackUsers requesting changes
 * @param slackMemberUsers slack member users on the team
 * @returns List of member slack users requesting changes
 */
export function getMembersReqChanges(
  slackUsersReqChanges: SlackUser[],
  slackMemberUsers: SlackUser[],
): SlackUser[] {
  const membersRequestingChanges: SlackUser[] = [];
  slackUsersReqChanges.forEach((slackUserReqChanges: SlackUser) => {
    slackMemberUsers.forEach((slackMember: SlackUser) => {
      if (slackMember.Slack_Name === slackUserReqChanges.Slack_Name
        && slackMember.Slack_Id === slackUserReqChanges.Slack_Id) {
          membersRequestingChanges.push(slackMember);
      }
    });
  });
  return membersRequestingChanges;
}

/**
 * @description Retrieve members not approving the PR
 * @param slackUsersNotApproving All Slack users not approving
 *                               the PR from the sub team (DevTeam1)
 * @param slackMemberUsers List of member slack users of a team (DevTeam)
 * @returns List of member slack users not approving
 */
export function getMembersNotApproving(
  slackUsersNotApproving: SlackUser[],
  slackMemberUsers: SlackUser[],
): SlackUser[] {
  const membersNotApproving: SlackUser[] = [];
  slackUsersNotApproving.forEach((notApproving: SlackUser) => {
    slackMemberUsers.forEach((slackMember: SlackUser) => {
      if (slackMember.Slack_Name === notApproving.Slack_Name
        && slackMember.Slack_Id === notApproving.Slack_Id) {
          membersNotApproving.push(slackMember);
      }
    });
  });
  return membersNotApproving;
}
