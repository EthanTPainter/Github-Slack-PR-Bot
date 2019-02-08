import { SlackUser } from "../../../../models";

/**
 * @author Ethan T Painter
 * @description Constructs description of a Merged PR
 * @param slackUser The slack user who opened the PR
 * @param slackUserMerging The slack user merging the PR
 * @param slackGroup Slack Group connecting all team members
 *                   Not implemented now (Add on an ad hoc basis)
 */
export function constructMergeDesc(slackUser: SlackUser,
                                   slackUserMerging: SlackUser,
                                   branchWithPR: string,
                                   branchMergedTo: string,
                                  ): string {
  // Error handling
  if (slackUser.Slack_Name === undefined
      || slackUser.Slack_Id === undefined)  {
        throw new Error("slackUser properties undefined");
  }
  if (slackUserMerging.Slack_Name === undefined
      || slackUserMerging.Slack_Id === undefined) {
        throw new Error("slackUserMerging properties undefined");
  }
  if (branchWithPR === "") {
    throw new Error("No branchWithPR provided");
  }
  if (branchMergedTo === "") {
    throw new Error("No branchMergedTo provided");
  }

  // If merged by owner, don't @ anyone
  let desc: string;
  if (slackUser.Slack_Name === slackUserMerging.Slack_Name) {
    desc = `${slackUser.Slack_Name} merged this PR from ${branchWithPR}`
      + ` to ${branchMergedTo}`;
  }
  else {
    desc = `${slackUserMerging.Slack_Name} merged this PR from ${branchWithPR}`
      + ` to ${branchMergedTo}. Owner: ${slackUser.Slack_Id}`;
  }

  return desc;
}
