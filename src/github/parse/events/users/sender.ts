/**
 * @description Retrieve the user who is sending an
 *              event to the PR (approving, commenting, etc.)
 * @param event Event received from the GitHub webhook
 * @returns String of the GitHub user sending an event to the PR
 */
export function getSender(event: any): string {
  if (event === undefined){
    throw new Error("event is undefined");
  }
  if (event.sender === undefined) {
    throw new Error("event.sender is undefined");
  }
  if (event.sender.login === undefined) {
    throw new Error("event.sender.login is undefined");
  }
  const user: string = event.sender.login;
  return user;
}
