import { getSlackUser } from "../../../json/parse";
import { SlackUser } from "../../../models";

/**
 * @author Ethan T Painter
 * @description Retrieve slack users approving the
 *              PR listed in reviews
 * @param reviews Array of GitHub users who approved the PR
 * @param json JSON file containing Github/Slack
 *             configuration
 * @returns Array of slackUser of slack usernames who
 *          approved the PR
 */
export function getUsersApproving(
  reviews: string[],
  json: any,
): SlackUser[] {
  const usersApproving: SlackUser[] = [];
  reviews.forEach((review) => {
    const slackName = getSlackUser(review, json);
    usersApproving.push(slackName);
  });
  return usersApproving;
}

/**
 * @author Ethan T Painter
 * @description Retrieve users who requested changes
 *              in the PR reviews list
 * @param reviews Array of GitHub users who requested
 *                changes to the PR
 * @param json JSON file containing GitHub/Slack
 *             configuration and relationship between
 *             usernames
 * @returns Array of SlackUser of slack usernames who
 *          requested changes to the PR
 */
export function getUsersReqChanges(
  reviews: string[],
  json: any,
): SlackUser[] {
  const usersReqChanges: SlackUser[] = [];
  reviews.forEach((review) => {
    const slackName = getSlackUser(review, json);
    usersReqChanges.push(slackName);
  });
  return usersReqChanges;
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
export function getUsersNotApproving(
  slackOwner: SlackUser,
  slackUsersApproving: string[],
  slackUsersRequestingChanges: string[],
  allSlackUsers: string[],
): string[] {
  const usersNotApproving: string[] = [];
  allSlackUsers.forEach((slackUser: string) => {
    if (slackUser === slackOwner
      || slackUsersApproving.includes(slackUser)
      || slackUsersRequestingChanges.includes(slackUser)) {
      // Do nothing
    } else {
      usersNotApproving.push(slackUser);
    }
  });
  return usersNotApproving;
}
