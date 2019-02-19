/**
 * @description Retrieve the stable branch used for the merge
 * @param event Event recieved by the GitHub webhook
 * @returns String of the stable branch used as the base
 */
export function getBaseBranch(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.base === undefined) {
    throw new Error("event.pull_request.base is undefined");
  }
  if (event.pull_request.base.ref === undefined) {
    throw new Error("event.pull_request.base.ref is undefined");
  }
  const branch: string = event.pull_request.base.ref;
  return branch;
}
