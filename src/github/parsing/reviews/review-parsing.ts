import { Review } from "../../../models/github/reviews";
import { Base } from "../../../slack/message/construct/formatting";

/**
 * @author Ethan T Painter
 * @description Processes reviews to determine latest review statuses and users
 * @param reviewList A list of reviews provided through a GET request to api.github.com
 * @returns An object with keys set to GitHub usernames and values as submission status
 * @example Example:
 * { "EthanTPainter": "COMMENTED",
 *   "gwely": "APPROVED",
 *   "DillonSykes": "CHANGES_REQUESTED"  }
 */

export function getLatestReviews(reviewList: Review[]): any {
  const reviews: any = {};

  // Start from the end to grab most recent
  if (reviewList.length === 0) {
    // No reviews yet
    return { None: "No Reviews"};
  }

  let counter = reviewList.length - 1;
  while (counter !== -1) {
    const selectedReviewUser: string = reviewList[counter].user.login;

    // If processing last review (first time through loop), must be most relevant
    if (counter === reviewList.length - 1) {
      reviews[selectedReviewUser] = reviewList[counter].state;
    }
    else {
      // If user not in reviews, add user: state
      // If user alread in reviews, move to the next review
      if ( (Object.keys(reviews)).includes(selectedReviewUser) ) {
        reviews[selectedReviewUser] = reviewList[counter].state;
      }
    }
    counter--;
  }
  return reviews;
}

/**
 * @author Ethan T Painter
 * @description From latest reviews, retrieve approvals
 * @param latestReviews Object with keys of Github usernames,
 *        values as state
 * @example
 * Input:
 * { "EthanTPainter": "APPROVED",
 *   "gwely": "COMMENTED",
 *   "DillonSykes": "CHANGES_REQUESTED"
 * }
 * Output:
 * { "EthanTPainter": "APPROVED"}
 */
export function getApprovingPRs(latestReviews: any): string[] {
  const approvals: any = [];
  let counter = 0;
  // Check for no reviews
  if ( Object.keys(latestReviews) === ["None"]
      && Object.values(latestReviews) === ["No Reviews"]) {
    console.log("No reviews found");
    return [];
  }

  // Loop through all GitHub usernames
  while (counter < (Object.keys(latestReviews)).length) {
    const key = Object.keys(latestReviews)[counter];
    // If GitHub username key has a value of APPROVED, append
    if (latestReviews[key] === "APPROVED") {
      approvals.push(latestReviews[key]);
    }
    counter++;
  }
  return approvals;
}

/**
 * @author Ethan T Painter
 * @description Retrieve leads listed in reviews
 * @param reviews Array of GitHub users who approved the PR
 * @param gitUsers Array of registered leads in the team
 * @returns Array of strings of slack usernames who approved the PR
 */
export function getUsersApproving(reviews: string[],
                                  gitUsers: string[],
                                ): string[] {
  const base: Base = new Base();
  const usersApproving: string[] = [];
  let counter = 0;
  // Loop through reviews
  while (counter < reviews.length) {
    // An approving user is in the Git Users
    if (gitUsers.includes(reviews[counter])) {
      // Get slakc name and add it to array
      const slackName: string = base.getSlackUser(reviews[counter]);
      usersApproving.push(slackName);
    }
    counter++;
  }
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
  let counter: number = 0;
  // Loop through reviews
  while (counter < allSlackUsers.length) {
    /* Exclude owner of the PR because they can't approve their own PR
     * Exclude slack users who have already approved the PR
     */
    if (allSlackUsers[counter] === slackOwner
      || slackUsersApproving.includes(allSlackUsers[counter])) {
      // Do nothing
    }
    // Otherwise, add to array
    else {
      usersNotApproving.push(allSlackUsers[counter]);
    }
    counter++;
  }
  return usersNotApproving;
}

/**
 * @author Ethan T Painter
 * @description From all slack users not approving
 *              the PR, select the lead slack users
 *              not approving the PR.
 * @param slackUsersNotApproving list of all slack users not approving
 *                               the PR.
 * @param slackLeadUsers List of lead slack users
 * @returns List of lead slack users not approving
 */
export function getLeadsNotApproving(slackUsersNotApproving: string[],
                                     slackLeadUsers: string[],
                                    ): string[] {
  const leadsNotApproving: string[] = [];
  let counter: number = 0;
  // Loop through all slack users not approving
  while (counter < slackUsersNotApproving.length) {
    if (slackLeadUsers.includes(slackUsersNotApproving[counter])) {
      leadsNotApproving.push(slackUsersNotApproving[counter]);
    }
    counter++;
  }
  return leadsNotApproving;
}

/**
 * @author Ethan T Painter
 * @description Retrieve members not approving the PR
 * @param slackUsersNotApproving All Slack users not approving
 *                               the PR
 * @param slackMemberUsers List of member slack users
 * @returns List of member slack users not approving
 */
export function getMembersNotApproving(slackUsersNotApproving: string[],
                                       slackMemberUsers: string[],
                                      ): string[] {
  const membersNotApproving: string[] = [];
  let counter: number = 0;
  // Loop through all slack users not approving
  while (counter < slackUsersNotApproving.length) {
    if (slackMemberUsers.includes(slackUsersNotApproving[counter])){
      membersNotApproving.push(slackUsersNotApproving[counter]);
    }
    counter++;
  }
  return membersNotApproving;
}
