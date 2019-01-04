import { ApprovePR } from "../../../../models";
import { Base, Approve } from "../formatting";

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

    // Listing users to know who to alert in Slack
    const exemptUsers: string[] = [slackUser, slackUserApproving];
    const allMembers: string[] = base.getMembers(owner);
    const allLeads: string[] = base.getLeads(owner);
    const allUsers: string[] = allLeads.concat(allMembers);

    // Get List of Members to @
    const membersList: string[] = approve.getMemberList(allMembers, exemptUsers);
    const leadList: string[] = approve.getMemberList(allLeads, exemptUsers);

    // Base Properties
    const description: string = approve.constructDescription(slackUser, slackUserApproving);
    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

    // Constuct ApprovePR object ot return
    const approveObj: ApprovePR = {
      description: description,
      title: title,
      owner: owner,
      user_approving: userApproving,
      peer_approval: true,
      lead_approval: true,
      can_merge: true,
      url: pr_url,
    };

    return approveObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
