/**
 * @author Ethan T Painter
 * @description Retrieve the stable branch used for the merge
 * @param event Event recieved by the GitHub webhook
 * @returns String of the stable branch used as the base
 */
export function getBaseBranch(event: any): string {
  try {
    const branch: string = event.pull_request.base.ref;
    return branch;
  }
  catch (error) {
    throw new Error("event.pull_request.base.ref not found in event");
  }
}
