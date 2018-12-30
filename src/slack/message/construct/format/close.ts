export class Close {

  /**
   * @author Ethan T Painter
   * @description Retrieve the owner of the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the user who opened the PR
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
   * @description Retrieve the user closing the PR (may differ from owner)
   * @param event Event received from the GitHub webhook
   * @returns String of the user who closed the PR
   */
  getUserClosingPR(event: any): string {
    try {
      const user: string = event.sender.login;
      return user;
    }
    catch (error) {
      throw new Error("event.sender.login not found in event");
    }
  }

}
