import * as json from "../../../../user-groups.json";

export class Base {

  /**
   * @author Ethan T Painter
   * @description Constructs title from GitHub event
   * @param event Event from GitHub webhook
   * @returns String of the title stored in the event
   */
  getTitle(event: any): string {
    try {
      const title: string = event.pull_request.title;
      return title;
    }
    catch (error) {
      throw new Error("Pull Request or Pull Request title not included in event");
    }
  }

  /**
   * @author EThan T Painter
   * @description Constructs url from GitHub event
   * @param event Event from GitHub webhook
   * @returns String of the url stored in the event
   */
  getPRLink(event: any): string {
    try {
      const url: string = event.pull_request.url;
      return url;
    }
    catch (error) {
      throw new Error("event.pull_request.url not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Given a GitHub user, find the corresponding Slack user in the JSON file
   * @param event Event received from the GitHub webhook
   * @returns String of the slack user corresponding to the Github user provided
   */
  getSlackUser(githubUser: string): string {
    const jsonFile: any = json;
    // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
    const teams: any = jsonFile.Teams;
    const allTeams: string[] = Object.keys(teams);
    // If no teams present, return error
    if (allTeams.length === 0) {
      throw new Error("No Team found in JSON file");
    }

    // Otherwise loop through teams to find gitHub user
    let counter: number = 0;
    while (counter < allTeams.length) {

    }

    return "placeholder";
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the slack group from the GitHub user
   * @param githubUser String of the GitHub user name
   * @returns String of the Slack group corresponding to the Github user provided
   */
  getSlackGroup(githubUser: string): string {
    return "placeholder";
  }
}
