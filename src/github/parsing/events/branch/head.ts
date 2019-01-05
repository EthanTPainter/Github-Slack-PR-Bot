/**
 * @author Ethan T Painter
 * @description Get the Branch the PR is located on
 * @param event Event recived by the GitHub webhook
 * @returns string of the branch used for the PR
 */
export function getPRBranch(event: any): string {
  try {
    const branch: string = event.pull_request.head.ref;
    return branch;
  }
  catch (error) {
    throw new Error("event.pull_request.head.ref not found in event");
  }
}
