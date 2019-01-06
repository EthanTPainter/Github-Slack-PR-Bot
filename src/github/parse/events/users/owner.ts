/**
 * @author Ethan T Painter
 * @description Retrieve the Owner of the PR
 * @param event Event received from the GitHub webhook
 * @returns String of the user who opened the PR
 */
export function getOwner(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.user === undefined) {
    throw new Error("event.pull_request.user is undefined");
  }
  if (event.pull_request.user.login === undefined) {
    throw new Error("event.pull_request.user.login is undefined");
  }
  const owner: string = event.pull_request.user.login;
  return owner;
}
