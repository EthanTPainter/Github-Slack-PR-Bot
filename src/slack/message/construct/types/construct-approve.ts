import {
  getOwner,
  getSender,
  getPath,
  getTitle,
  getPRLink,
  getLatestReviews,
} from "../../../../github/parse";

import {
  getSlackUser,
  getSlackMembers,
  getSlackLeads,
} from "../../../../json/parse";

import { Review } from "../../../../github/api";

import {
  constructApproveDesc,
} from "../description";

import { ApprovePR } from "../../../../models";
import { getApprovalChecks } from "../checks/approval";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructApprove");

/**
 * @description Construction of approval list for PR
 * @param event Event from the GitHub webhook
 * @returns ApprovePR object with all important characteristics
 */
export async function constructApprove(
  reviewClass: Review,
  event: any,
  json: any,
): Promise<ApprovePR> {

  try {
    // ApprovePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    // Use GitHub user names to select slack user and slack user approving
    const owner = getOwner(event);
    const userApproving = getSender(event);
    const slackUser = getSlackUser(owner, json);
    const slackUserApproving = getSlackUser(userApproving, json);

    // Get Path and GET any existing reviews
    const path = getPath(event);
    const allReviews = await reviewClass.getReviews(path);
    const reviews = getLatestReviews(allReviews);

    logger.debug("Latest Reviews: " + JSON.stringify(reviews));

    // Get All Slack and GitHub users for a team
    const allSlackTeamMembers = getSlackMembers(owner, json);
    const allSlackTeamLeads = getSlackLeads(owner, json);

    // Construct Member and Lead Approvals strings
    const approvals = getApprovalChecks(json, slackUser, reviews,
      allSlackTeamMembers, allSlackTeamLeads);

    // Base Properties
    const description = constructApproveDesc(slackUser, slackUserApproving);
    const title = getTitle(event);
    const pr_url = getPRLink(event);

    // Constuct ApprovePR object to return
    const approveObj = {
      description: description,
      title: title,
      owner: owner,
      user_approving: userApproving,
      url: pr_url,
      approvals: approvals,
    };

    logger.debug(`ApprovePR: ${JSON.stringify(approveObj)}`);

    return approveObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
