/**
 * @author Ethan T Painter
 * @description Retrieve the Owner of the PR
 * @param event Event received from the GitHub webhook
 * @returns String of the user who opened the PR
 */
export function getOwner(event: any): string {
  try {
    const owner: string = event.pull_request.user.login;
    return owner;
  }
  catch (error) {
    throw new Error("event.pull_request.login not found in event");
  }
}
