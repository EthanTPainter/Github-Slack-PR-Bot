export class RequestChanges {

  /**
   * @author Ethan T Painter
   * @description Construct description when a user requests changes
   * @param slackUser Slack user who owns the PR
   * @param SlackUserRequesting Slack user who is requesting PR changes
   * @returns String of the description
   */
  constructDescription(slackUser: string, SlackUserRequesting: string): string {
    const desc: string = `@${SlackUserRequesting} is requesting changes to this PR. (Owner: @${slackUser})`;
    return desc;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieves the owner of the PR
   * @param event Event recevied from the GitHub webhook
   * @returns string of the owner of the PR
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
   * @description Retrieve the GitHub user merging the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the GitHub user merging the PR
   */
  getRequestingUser(event: any): string {
    try {
      const userRequesting: string = event.sender.login;
      return userRequesting;
    }
    catch (error) {
      throw new Error("event.sender.login not found in event");
    }
  }
}
