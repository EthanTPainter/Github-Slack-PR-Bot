/**
 * @description Get the Branch the PR is located on
 * @param event Event recived by the GitHub webhook
 * @returns string of the branch used for the PR
 */
export function getPRBranch(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.head === undefined) {
    throw new Error("event.pull_request.head is undefined");
  }
  if (event.pull_request.head.ref === undefined) {
    throw new Error("event.pull_request.head.ref is undefined");
  }
  const branch: string = event.pull_request.head.ref;
  return branch;
}
