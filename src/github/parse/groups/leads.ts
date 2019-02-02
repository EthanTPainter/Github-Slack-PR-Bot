/**
 * @author Ethan T Painter
 * @description get all leads approving the PR
 * @param slackUsersApproving All slack users approving this PR
 * @param allSlackLeadUsers All slack lead users in the team
 */
export function getLeadsApproving(slackUsersApproving: string[],
                                  allSlackLeadUsers: string[],
                                 ): string[]
{
  const leadsApproving: string[] = [];
  slackUsersApproving.forEach((slackUser: string) => {
    if (allSlackLeadUsers.includes(slackUser)) {
      leadsApproving.push(slackUser);
    }
  });
  return leadsApproving;
}

/**
 * @author Ethan T Painter
 * @description get all leads requesting changes to PR
 * @param slackUsersReqChanges All slack leads requesting changes
 *                             to the PR
 * @param allSlackLeadUsers All slack lead users in the team
 */
export function getLeadsReqChanges(slackUsersReqChanges: string[],
                                   allSlackLeadUsers: string[],
                                  ): string[]
{
  const leadsReqChanges: string[] = [];
  slackUsersReqChanges.forEach((slackUser: string) => {
    if (allSlackLeadUsers.includes(slackUser)) {
      leadsReqChanges.push(slackUser);
    }
  });
  return leadsReqChanges;
}

/**
 * @author Ethan T Painter
 * @description From all slack users not approving
 *              the PR, select the lead slack users
 *              not approving the PR.
 * @param slackUsersNotApproving list of all slack users not approving
 *                               the PR from a sub team (DevTeam1)
 * @param allSlackLeadUsers List of lead slack users for a team (DevTeam)
 * @returns List of lead slack users not approving
 */
export function getLeadsNotApproving(slackUsersNotApproving: string[],
                                     allSlackLeadUsers: string[],
                                    ): string[]
{
  const leadsNotApproving: string[] = [];
  slackUsersNotApproving.forEach((notApprover) => {
    if (allSlackLeadUsers.includes(notApprover)) {
      leadsNotApproving.push(notApprover);
    }
  });
  return leadsNotApproving;
}
