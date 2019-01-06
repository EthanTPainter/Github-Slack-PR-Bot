import {
  getOwner,
  getSender,
  getPRBranch,
  getBaseBranch,
  getTitle,
  getPRLink,
} from "../../../../github/parsing";

import { MergePR } from "../../../../models";
import { getSlackUser } from "../../../../json/parse";
import { constructMergeDesc } from "../../formatting";

export function constructMerge(event: string): MergePR {

  try {
    // Merge Properties
    const owner: string = getOwner(event);
    const userMerging: string = getSender(event);
    const branchWithPR: string = getPRBranch(event);
    const branchMergedTo: string = getBaseBranch(event);

    // REMOVE JSON WITH REAL JSON FILE
    const json: any = {};

    // Use owner variable to grab Slack names
    const slackUser: string = getSlackUser(owner, json);
    const slackUserMerging: string = getSlackUser(userMerging, json);

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
