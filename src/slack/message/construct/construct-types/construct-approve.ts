import { ApprovePR } from "../../../../models";
import { Base, Approve } from "../formatting";
import { getReviews } from "src/github/api/github";
import { getPath, getPrivateProp } from "src/github/parsing/events/event-parsing";
import { getApprovingPRs, getUsersApproving, getUsersNotApproving } from "src/github/parsing/reviews/review-parsing";

/**
 * @author Ethan T Painter
 * @description Construction of approval list for PR
 * @param event Event from the GitHub webhook
 * @returns ApprovePR object with all important characteristics
 */
export function constructApprove(event: any): ApprovePR {
  const base: Base = new Base();
  const approve: Approve = new Approve();

  try {
    // ApprovePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    const owner: string = approve.getOwner(event);
    const userApproving: string = approve.getUserApproving(event);

    // Use owner variable to grab Slack name and group
    const slackUser: string = base.getSlackUser(owner);
    const slackUserApproving: string = base.getSlackUser(userApproving);

    // Get Path and Private property values for
    // making GET request to GitHub API
    const path: string = getPath(event);
    const privateVal: boolean = getPrivateProp(event);

    // Get all existing reviews of the PR
    const reviews: any = getReviews(path, privateVal);

    // Listing users to know who to alert in Slack
    const allSlackMembers: string[] = base.getSlackMembers(owner);
    const allSlackLeads: string[] = base.getSlackLeads(owner);
    const allSlackUsers: string[] = allSlackLeads.concat(allSlackMembers);
    // All GitHub users in slack
    const allGitTeamUsers: string[] = base.getGitHubTeamUsers(owner);

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
    const memberList: string[] = approve.getMemberList(allSlackMembers, exemptUsers);
    const leadList: string[] = approve.getMemberList(allSlackLeads, exemptUsers);

    // Base Properties
    const description: string = approve.constructDescription(slackUser,
      slackUserApproving);

    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

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
