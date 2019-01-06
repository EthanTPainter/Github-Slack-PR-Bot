
/**
 * @author Ethan T Painter
 * @description Constructs description of a Merged PR
 * @param slackUser The slack user who opened the PR
 * @param slackUserMerging The slack user merging the PR
 * @param slackGroup Slack Group connecting all team members
 *                   Not implemented now (Add on an ad hoc basis)
 */
export function constructMergeDesc(slackUser: string,
                                   slackUserMerging: string,
                                   branchWithPR: string,
                                   branchMergedTo: string,
                                  ): string {
  if (slackUser === "") {
    throw new Error("No slackUser provided");
  }
  if (slackUserMerging === "") {
    throw new Error("No slackUserMerging provided");
  }
  if (branchWithPR === "") {
    throw new Error("No branchWithPR provided");
  }
  if (branchMergedTo === "") {
    throw new Error("No branchMergedTo provided");
  }
  const desc: string = `${slackUserMerging} merged this PR ` +
    `from ${branchWithPR} to ${branchMergedTo}. Owner: @${slackUser}`;
  return desc;
}
