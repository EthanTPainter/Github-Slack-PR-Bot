/**
 * @author Ethan T Painter
 * @description Retrieve the user who is sending an
 *              event to the PR (approving, commenting, etc.)
 * @param event Event received from the GitHub webhook
 * @returns String of the GitHub user sending an event to the PR
 */
export function getSender(event: any): string {
  try {
    const user: string = event.sender.login;
    return user;
  }
  catch (error) {
    throw new Error("event.sender.login not found in event");
  }
}
