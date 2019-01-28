import { getSlackUser } from "../../../json/parse";

/**
 * @author Ethan T Painter
 * @description From latest reviews (key/value pairs of github
 *        users, ), retrieve approvals
 * @param latestReviews Object with keys of Github usernames,
 *        values as state
 * @returns array of github users who approved the PR
 * @example
 * Input:
 * { "EthanTPainter": "APPROVED",
 *   "gwely": "COMMENTED",
 *   "DillonSykes": "CHANGES_REQUESTED"
 * }
 * Output:
 * ["EthanTPainter"]
 */
export function getApprovingReviews(latestReviews: any): string[] {
  const approvals: any = [];
  // Check for no reviews
  if (Object.keys(latestReviews) === ["None"]
    && Object.values(latestReviews) === ["No Reviews"]) {
    return [];
  }

  (Object.keys(latestReviews)).forEach((review) => {
    if (latestReviews[review] === "APPROVED") {
      approvals.push(review);
    }
  });
  return approvals;
}

/**
 * @author Ethan T Painter
 * @description Retrieve leads listed in reviews
 * @param reviews Array of GitHub users who approved the PR
 * @param json JSON file containing Github/Slack configuration
 * @returns Array of strings of slack usernames who approved the PR
 */
export function getUsersApproving(reviews: string[],
                                  jsonFile: any,
                                ): string[] {
  const usersApproving: string[] = [];
  reviews.forEach((review) => {
    const slackName = getSlackUser(review, jsonFile);
    usersApproving.push(slackName);
  });
  return usersApproving;
}

/**
 * @author Ethan T Painter
 * @description Generate a list of slack users not approving
 *              so we can select these people later on.
 * @param owner Slack user who owns the PR
 * @param slackUsersApproving Array of all slack users who
 *                            have already approved the PR.
 * @param allSlackUsers Array of all Slack users in a team
 * @returns Array of all users who have not yet approved the PR
 */
export function getUsersNotApproving(slackOwner: string,
                                     slackUsersApproving: string[],
                                     allSlackUsers: string[],
                                    ): string[] {
  const usersNotApproving: string[] = [];
  allSlackUsers.forEach((slackUser: string) => {
    if (slackUser === slackOwner
      || slackUsersApproving.includes(slackUser)) {
        // Do nothing
    } else {
      usersNotApproving.push(slackUser);
    }
  });
  return usersNotApproving;
}

/**
 * @author Ethan T Painter
 * @description get all leads approving the PR
 * @param slackUsersApproving All slack users approving this PR
 * @param allSlackLeadUsers All slack lead users
 */
export function getLeadsApproving(slackUsersApproving: string[],
                                  allSlackLeadUsers: string[],
                                 ): string[] {
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
                                    ): string[] {
  const leadsNotApproving: string[] = [];
  slackUsersNotApproving.forEach((notApprover) => {
    if (allSlackLeadUsers.includes(notApprover)) {
      leadsNotApproving.push(notApprover);
    }
  });
  return leadsNotApproving;
}

/**
 * @author Ethan T Painter
 * @description Get all slack members approving the PR
 * @param slackUsersApproving Slack users approving the PR
 * @param slackMemberUsers All Slack member users on the team
 * @returns List of member slack users approving
 */
export function getMembersApproving(slackUsersApproving: string[],
                                    slackMemberUsers: string[],
                                  ): string[] {
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
 * @description Retrieve members not approving the PR
 * @param slackUsersNotApproving All Slack users not approving
 *                               the PR from the sub team (DevTeam1)
 * @param slackMemberUsers List of member slack users of a team (DevTeam)
 * @returns List of member slack users not approving
 */
export function getMembersNotApproving(slackUsersNotApproving: string[],
                                       slackMemberUsers: string[],
                                      ): string[] {
  const membersNotApproving: string[] = [];
  slackUsersNotApproving.forEach((notApprover) => {
    if (slackMemberUsers.includes(notApprover)) {
      membersNotApproving.push(notApprover);
    }
  });
  return membersNotApproving;
}
