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
      const url: string = event.pull_request.html_url;
      return url;
    }
    catch (error) {
      throw new Error("event.pull_request.html_url not found in event");
    }
  }

  /**
   * Not enough information about which team the user is in, so search all (for now)
   * @author Ethan T Painter
   * @description Given a GitHub user, find the corresponding Slack user in the JSON file
   * @param event Event received from the GitHub webhook
   * @returns String of the slack user corresponding to the Github user provided
   */
  getSlackUser(githubUser: string): string {
    const jsonFile: any = json;
    // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
    const teams: any = jsonFile.Teams;
    const allTeamKeys: string[] = Object.keys(teams);
    // If no teams present, return error
    if (allTeamKeys.length === 0) {
      throw new Error("No Team found in JSON file");
    }

    // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
    let teamCounter: number = 0;
    while (teamCounter < allTeamKeys.length) {
      // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
      const selectedTeam: string = allTeamKeys[teamCounter];
      const selectedTeamGroup: any = teams[selectedTeam];
      const teamGroupKeys: string[] = Object.keys(selectedTeamGroup);
      let selectedTeamTypeCounter: number = 0;
      // Loop through team groups (DevTeam1, DevTeam2, etc.)
      while (selectedTeamTypeCounter < teamGroupKeys.length) {
        // Retrieve usersfrom JSON
        const users: any = selectedTeamGroup.Users;
        // Check if githubUser is a Lead for the group
        // There may exist multiple users in Lead json
        const leadUsers: any = users.Lead;
        const leadKeys: string[] = Object.keys(leadUsers);
        let leadCounter: number = 0;
        // Loop through lead keys for matching GitHub User
        while (leadCounter < leadKeys.length) {
          // Check if key matches GitHub user
          if (leadKeys[leadCounter] === githubUser) {
            return leadUsers[leadCounter];
          }
          leadCounter++;
        }

        // User not found in Lead group. Check member group
        const memberUsers: any = users.Members;
        const memberKeys: string[] = Object.keys(memberUsers);
        let memberCounter: number = 0;
        // Loop through member keys for matching GitHub User
        while (memberCounter < memberKeys.length) {
          // Check if key matches GitHub user
          if (memberKeys[memberCounter] === githubUser) {
            return memberUsers[memberCounter];
          }
          memberCounter++;
        }

        // If GitHub user not found in lead or member groups
        // The user must be in a different group
        selectedTeamTypeCounter++;
      }
      // User not found in General Team (DevTeam), look at antoher team
      teamCounter++;
    }
    // Looped through all teams and couldn't find github user
    // Throw error because of user not found
    throw new Error(`GitHub user: ${githubUser} could not be found in designated JSON file`);
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the slack group from the GitHub user
   * @param githubUser String of the GitHub user name
   * @returns String of the Slack group corresponding to the Github user provided
   */
  getSlackGroup(githubUser: string): string {
    const jsonFile: any = json;
    // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
    const teams: any = jsonFile.Teams;
    const allTeamKeys: string[] = Object.keys(teams);
    // If no teams present, return error
    if (allTeamKeys.length === 0) {
      throw new Error("No Major Team found in designated JSON file");
    }

    // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
    let teamCounter: number = 0;
    while (teamCounter < allTeamKeys.length) {
      // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
      const selectedTeam: string = allTeamKeys[teamCounter];
      const selectedTeamGroup: any = teams[selectedTeam];
      const teamGroupKeys: string[] = Object.keys(selectedTeamGroup);
      let selectedTeamTypeCounter: number = 0;
      // Loop through team groups (DevTeam1, DevTeam2, etc.)
      while (selectedTeamTypeCounter < teamGroupKeys.length) {
        // Retrieve users and groups from JSON
        const users: any = selectedTeamGroup.Users;
        const group: string = selectedTeamGroup.Slack_Group;
        // If group doesn't exist in JSON, skip group
        if (!group) {
          selectedTeamTypeCounter = teamGroupKeys.length;
        } else {
          // Check if githubUser is a Lead for the group
          // There may exist multiple users in Lead json
          const leadUsers: any = users.Lead;
          const leadKeys: string[] = Object.keys(leadUsers);
          let leadCounter: number = 0;
          // Loop through lead keys for matching GitHub User
          while (leadCounter < leadKeys.length) {
            // Check if key matches GitHub user
            if (leadKeys[leadCounter] === githubUser) {
              return group;
            }
            leadCounter++;
          }

          // User not found in Lead group. Check member group
          const memberUsers: any = users.Members;
          const memberKeys: string[] = Object.keys(memberUsers);
          let memberCounter: number = 0;
          // Loop through member keys for matching GitHub User
          while (memberCounter < memberKeys.length) {
            // Check if key matches GitHub user
            if (memberKeys[memberCounter] === githubUser) {
              return group;
            }
            memberCounter++;
          }
          // If GitHub user not found in lead or member groups
          // The user must be in a different group
          selectedTeamTypeCounter++;
        }
      }
      // User not found in General Team (DevTeam), look at antoher team
      teamCounter++;
    }
    // Looped through all teams and couldn't find github group for user
    // Return empty string for no group found
    return "";
  }
}
