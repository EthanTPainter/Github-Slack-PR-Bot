import {
  getOwner,
  getSender,
  getPRBranch,
  getBaseBranch,
  getTitle,
  getPRLink,
} from "src/github/parsing";

import { MergePR } from "../../../../models";
import { getSlackUser } from "src/json/parse";
import { constructMergeDesc } from "../../formatting";

export function constructMerge(event: string): MergePR {

  try {
    // Merge Properties
    const owner: string = getOwner(event);
    const userMerging: string = getSender(event);
    const branchWithPR: string = getPRBranch(event);
    const branchMergedTo: string = getBaseBranch(event);

    // Use owner variable to grab Slack names
    const slackUser: string = getSlackUser(owner);
    const slackUserMerging: string = getSlackUser(userMerging);

    // Base Properties
    const description: string = constructMergeDesc(slackUser,
      slackUserMerging, branchWithPR, branchMergedTo);

    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

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
