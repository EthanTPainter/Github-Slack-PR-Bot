export class Merge {

  /**
   * @author Ethan T Painter
   * @description Constructs description of a Merged PR
   * @param slackUser The slack user who opened the PR
   * @param slackUserMerging The slack user merging the PR
   * @param slackGroup Slack Group connecting all team members
   *                   Not implemented now (Add on an ad hoc basis)
   */
  constructDescription(slackUser: string,
                       slackUserMerging: string,
                       branchWithPR: string,
                       branchMergedTo: string,
                       slackGroup?: string): string {
    const desc: string = `@${slackUser} merged this PR ` +
        `from ${branchWithPR} to ${branchMergedTo} (Owner: @${slackUserMerging})`;
    return desc;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieves the owner of the PR
   * @param event Event recevied from the GitHub webhook
   * @returns string of the owner of the PR
   */
  getOwner(event: any): string {
    try {
      const owner: string = event.pull_request.user.login;
      return owner;
    }
    catch (error) {
      throw new Error("event.pull_request.user.login not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the GitHub user merging the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the GitHub user merging the PR
   */
  getUserMerging(event: any): string {
    try {
      const userMerging: string = event.sender.login;
      return userMerging;
    }
    catch (error) {
      throw new Error("event.sender.login not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Get the Branch the PR is located on
   * @param event Event recived by the GitHub webhook
   * @returns string of the branch used for the PR
   */
  getPRBranch(event: any): string {
    try {
      const branch: string = event.pull_request.head.ref;
      return branch;
    }
    catch (error) {
      throw new Error("event.pull_request.head.ref not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the stable branch used for the merge
   * @param event Event recieved by the GitHub webhook
   * @returns String of the stable branch used as the base
   */
  getBaseBranch(event: any): string {
    try {
      const branch: string = event.pull_request.base.ref;
      return branch;
    }
    catch (error) {
      throw new Error("event.pull_request.base.ref not found in event");
    }
  }
}
