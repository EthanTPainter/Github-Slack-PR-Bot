import {
  getOwner,
  getSender,
  getPath,
  getApprovingReviews,
  getUsersApproving,
  getUsersNotApproving,
  getTitle,
  getPRLink,
  getLatestReviews,
} from "../../../../github/parse";

import {
  getSlackUser,
  getSlackMembers,
  getSlackLeads,
  getGitHubTeamUsers,
} from "../../../../json/parse";

import { Review } from "../../../../github/api";

import {
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
export async function constructApprove(event: any, json: any): Promise<ApprovePR> {

  let approveObj: ApprovePR;
  try {
    // ApprovePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    // Use GitHub user names to select slack user and slack user approving
    const owner = getOwner(event);
    const userApproving = getSender(event);
    const slackUser = getSlackUser(owner, json);
    const slackUserApproving = getSlackUser(userApproving, json);

    // Get Path and GET any existing reviews
    const ReviewClass = new Review();
    const path = getPath(event);
    const allReviews = await ReviewClass.getReviews(path);
    const reviews = getLatestReviews(allReviews);

    // Get All Slack and GitHub users for a team
    const allSlackTeamMembers = getSlackMembers(owner, json);
    const allSlackTeamLeads = getSlackLeads(owner, json);

    // Construct Peer and Lead Approvals strings
    const approvals = getApprovalChecks(slackUser, reviews,
                  allSlackTeamMembers, allSlackTeamLeads);

    // Base Properties
    const description = constructApproveDesc(slackUser, slackUserApproving);
    const title = getTitle(event);
    const pr_url = getPRLink(event);

    // Constuct ApprovePR object to return
    approveObj = {
      description: description,
      title: title,
      owner: owner,
      user_approving: userApproving,
      url: pr_url,
      approvals: approvals,
    };
  }
  catch (error) {
    throw new Error(error.message);
  }

  return approveObj;
}
