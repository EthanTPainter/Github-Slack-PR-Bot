
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
                                   slackGroup?: string,
                                  ): string {
  const desc: string = `@${slackUser} merged this PR ` +
    `from ${branchWithPR} to ${branchMergedTo} (Owner: @${slackUserMerging})`;
  return desc;
}
