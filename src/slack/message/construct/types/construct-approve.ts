import {
  getOwner,
  getSender,
  getPath,
  getPrivateProp,
  getApprovingPRs,
  getUsersApproving,
  getUsersNotApproving,
  getTitle,
  getPRLink,
} from "../../../../github/parse";

import {
  getSlackUser,
  getSlackMembers,
  getSlackLeads,
  getGitHubTeamUsers,
} from "../../../../json/parse";

import { getReviews } from "../../../../github/api";
import { getMemberList, constructApproveDesc } from "../../formatting";
import { ApprovePR } from "../../../../models";

/**
 * @author Ethan T Painter
 * @description Construction of approval list for PR
 * @param event Event from the GitHub webhook
 * @returns ApprovePR object with all important characteristics
 */
export function constructApprove(event: any, json: any): ApprovePR {

  try {
    // ApprovePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    const owner: string = getOwner(event);
    const userApproving: string = getSender(event);

    // Use owner variable to grab Slack name and group
    const slackUser: string = getSlackUser(owner, json);
    const slackUserApproving: string = getSlackUser(userApproving, json);

    // Get Path and Private property values for
    // making GET request to GitHub API
    const path: string = getPath(event);
    const privateVal: boolean = getPrivateProp(event);

    // Get all existing reviews of the PR
    const reviews: any = getReviews(path, privateVal);

    // Listing users to know who to alert in Slack
    const allSlackMembers: string[] = getSlackMembers(owner, json);
    const allSlackLeads: string[] = getSlackLeads(owner, json);
    const allSlackUsers: string[] = allSlackLeads.concat(allSlackMembers);

    // All GitHub users in slack
    const allGitTeamUsers: string[] = getGitHubTeamUsers(owner, json);

    // Record only approving reviews of the PR
    const approvingReviews: string[] = getApprovingPRs(reviews);

    // Users approving the Reviews (Slack Usernames)
    const usersApproving: string[] = getUsersApproving(approvingReviews,
      allGitTeamUsers);

    // Users not approving the Reviews (Slack usernames)
    const usersNotApproving: string[] = getUsersNotApproving(slackUser,
      usersApproving, allSlackUsers);

    const checks: string = "";

    // Construct exemptUsers
    const exemptUsers: string[] = [slackUser, slackUserApproving];

    // Get List of Members to @
    const memberList: string[] = getMemberList(allSlackMembers, exemptUsers);
    const leadList: string[] = getMemberList(allSlackLeads, exemptUsers);

    // Base Properties
    const description: string = constructApproveDesc(slackUser,
      slackUserApproving);

    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Constuct ApprovePR object to return
    const approveObj: ApprovePR = {
      description: description,
      title: title,
      owner: owner,
      user_approving: userApproving,
      checks: checks,
      url: pr_url,
    };

    return approveObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
