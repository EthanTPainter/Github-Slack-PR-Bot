export class Comment {

  /**
   * @author Ethan T Painter
   * @description Construct the description when a user comments
   * @param slackUser The slack user who opened the PR
   * @param commentingUser The slack user who commented on the PR
   */
  constructDescription(slackUser: string, commentingUser: string): string {
    const desc: string = `@${commentingUser} has commented on this PR (Owner: ${slackUser})`;
    return desc;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the owner of the PR
   * @param event Event received from the GitHub webhook
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
   * @description Retrieve the user commenting on the PR
   * @param event Event received from the GitHub webhook
   */
  getUserCommenting(event: any): string {
    try {
      const user: string = event.sender.login;
      return user;
    }
    catch (error) {
      throw new Error("event.sender.login not found in event");
    }
  }
}
