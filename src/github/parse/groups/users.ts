import { getSlackUser } from "../../../json/parse";
import { SlackUser } from "../../../models";

/**
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
 * @description Generate a list of slack users not approving
 *              so we can select these people later on.
 * @param slackOwner SlackUser who owns the PR
 * @param slackUsersApproving Array of all slack users who
 *                            have already approved the PR.
 * @param slackUsersRequestingChanges Array if SlackUsers who
 *                                    have requested changes
 * @param allSlackUsers Array of all Slack users in a team
 * @returns Array of all SlackUsers who have not yet approved the PR
 */
export function getUsersNotApproving(
  slackOwner: SlackUser,
  slackUsersApproving: SlackUser[],
  slackUsersRequestingChanges: SlackUser[],
  allSlackUsers: SlackUser[],
): SlackUser[] {
  const usersNotApproving: SlackUser[] = [];
  allSlackUsers.map((slackUser: SlackUser) => {
    let foundUserApproving = false;
    let foundUserReqChanges = false;
    slackUsersApproving.map((userApproving: SlackUser) => {
      if (userApproving.Slack_Name === slackUser.Slack_Name
        && userApproving.Slack_Id === slackUser.Slack_Id){
          foundUserApproving = true;
      }
    });
    slackUsersRequestingChanges.map((userReqChanges: SlackUser) => {
      if (userReqChanges.Slack_Name === slackUser.Slack_Name
        && userReqChanges.Slack_Id === slackUser.Slack_Id) {
          foundUserReqChanges = true;
      }
    });

    if (slackUser.Slack_Name === slackOwner.Slack_Name
        || foundUserApproving || foundUserReqChanges) {
          // Do nothing
    }
    else {
      usersNotApproving.push(slackUser);
    }
  });
  return usersNotApproving;
}
