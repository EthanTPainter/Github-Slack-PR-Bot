/**
 * @author Ethan T Painter
 * @description Get all slack members approving the PR
 * @param slackUsersApproving Slack users approving the PR
 * @param slackMemberUsers All Slack member users on the team
 * @returns List of member slack users approving
 */
export function getMembersApproving(slackUsersApproving: string[],
                                    slackMemberUsers: string[],
                                   ): string[]
{
  const membersApproving: string[] = [];
  slackUsersApproving.forEach((slackUserApproving: string) => {
    if (slackMemberUsers.includes(slackUserApproving)) {
      membersApproving.push(slackUserApproving);
    }
  });
  return membersApproving;
}

/**
 * @author Ethan T Painter
 * @description Get all slack members requesting changes
 * @param slackUsersReqChanges Slack users requesting changes
 * @param slackMemberUsers slack member users on the team
 * @returns List of member slack users requesting changes
 */
export function getMembersReqChanges(slackUsersReqChanges: string[],
                                     slackMemberUsers: string[],
                                    ): string[]
{
  const membersRequestingChanges: string[] = [];
  slackUsersReqChanges.forEach((slackUserReqChanges: string) => {
    if (slackMemberUsers.includes(slackUserReqChanges)) {
      membersRequestingChanges.push(slackUserReqChanges);
    }
  });
  return membersRequestingChanges;
}

/**
 * @author Ethan T Painter
 * @description Retrieve members not approving the PR
 * @param slackUsersNotApproving All Slack users not approving
 *                               the PR from the sub team (DevTeam1)
 * @param slackMemberUsers List of member slack users of a team (DevTeam)
 * @returns List of member slack users not approving
 */
export function getMembersNotApproving(slackUsersNotApproving: string[],
                                       slackMemberUsers: string[],
                                      ): string[]
{
  const membersNotApproving: string[] = [];
  slackUsersNotApproving.forEach((notApprover) => {
    if (slackMemberUsers.includes(notApprover)) {
      membersNotApproving.push(notApprover);
    }
  });
  return membersNotApproving;
}
