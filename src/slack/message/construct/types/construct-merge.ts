import { MergePR } from "../../../../models";
import { Base, Merge } from "../formatting";

export function constructMerge(event: string): MergePR {
  const base: Base = new Base();
  const merge: Merge = new Merge();

  try {
    // Merge Properties
    const owner: string = merge.getOwner(event);
    const userMerging: string = merge.getUserMerging(event);
    const branchWithPR: string = merge.getPRBranch(event);
    const branchMergedTo: string = merge.getBaseBranch(event);

    // Use owner variable to grab Slack names
    const slackUser: string = base.getSlackUser(owner);
    const slackUserMerging: string = base.getSlackUser(userMerging);

    // Base Properties
    const description: string = merge.constructDescription(slackUser,
      slackUserMerging, branchWithPR, branchMergedTo);

    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

    // Construct MergePR object to return
    const mergeObj: MergePR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_merging: userMerging,
      remote_branch: branchWithPR,
      base_branch: branchMergedTo,
    };

    return mergeObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
