import {
  getOwner,
  getSender,
  getPath,
  getApprovingReviews,
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

import {
  getMemberList,
  getLeadList,
  constructApproveDesc,
} from "../../formatting";

import { ApprovePR } from "../../../../models";
import { getApprovalChecks } from "../checks/approval";

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
    // Use GitHub user names to select slack user and slack user approving
    const owner: string = getOwner(event);
    const userApproving: string = getSender(event);
    const slackUser: string = getSlackUser(owner, json);
    const slackUserApproving: string = getSlackUser(userApproving, json);

    // Get Path and GET any existing reviews
    const path: string = getPath(event);
    const reviews: any = getReviews(path);

    // Get All Slack and GitHub users for a team
    const allSlackTeamMembers: string[] = getSlackMembers(owner, json);
    const allSlackTeamLeads: string[] = getSlackLeads(owner, json);
    const allSlackTeamUsers: string[] = allSlackTeamLeads.concat(allSlackTeamMembers);
    const allGitTeamUsers: string[] = getGitHubTeamUsers(owner, json);

    // Record only approving reviews of the PR
    const approvingReviews: string[] = getApprovingReviews(reviews);

    // Get all Users for a sub team
    // approving the Reviews (Slack Usernames) and
    // those not approving (Slack Usernames)
    const usersApproving: string[] = getUsersApproving(approvingReviews,
      allGitTeamUsers);
    const usersNotApproving: string[] = getUsersNotApproving(slackUser,
      usersApproving, allSlackTeamUsers);

    // Construct exemptUsers
    const exemptUsers: string[] = [slackUser];

    const approvals = getApprovalChecks(slackUser, approvingReviews,
                                     allSlackTeamMembers, allSlackTeamLeads);

    // Base Properties
    const description: string = constructApproveDesc(slackUser, slackUserApproving);
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Constuct ApprovePR object to return
    const approveObj: ApprovePR = {
      description: description,
      title: title,
      owner: owner,
      user_approving: userApproving,
      url: pr_url,
      approvals: approvals,
    };

    return approveObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
