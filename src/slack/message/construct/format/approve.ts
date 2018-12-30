export class Approve {

  /**
   * @author Ethan T Painter
   * @description Function used to construct the description
   * @param Add_something_here_when_I_figure_out_whats_required
   * @returns string of the description for the Slack Message
   */
  constructDescription(): string {
    return "";
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the Owner of the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the user who opened the PR
   */
  getOwner(event: any): string {
    try {
      const owner: string = event;
      return owner;
    }
    catch (error) {
      throw new Error("");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the user who is approving the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the user approving the PR
   */
  getUserApproving(event: any): string {
    return "";
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether a peer has approved a PR
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether a peer has approved the PR or not
   */
  getPeerApproval(event: any): boolean {
    return false;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether a lead has approved a PR
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether a lead has approved the PR or not
   */
  getLeadApproval(event: any): boolean {
    return false;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether the CI/Pipeline was successfully built
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether the pipeline succeeded to build
   */
  getCISuccess(event: any): string {
    return "";
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether the current PR is mergable
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether the PR is currently mergable
   */
  getMergeableState(event: any): boolean {
    return false;
  }
}
