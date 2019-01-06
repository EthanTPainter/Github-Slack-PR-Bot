import json from "../../src/user-groups.json";

/**
 * @author Ethan T Painter
 * @description Using the GitHub username, find the
 *       group and retrieve the leads for that group
 * @param githubUser GitHub username in JSON file
 * @returns array of Slack users
 */
export function getSlackLeads(githubUser: string): string[] {
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
      const leadUsers: any = users.Leads;
      const leadKeys: string[] = Object.keys(leadUsers);
      let leadCounter: number = 0;
      // Loop through lead keys for matching GitHub User
      while (leadCounter < leadKeys.length) {
        // Check if key matches GitHub user
        if (leadKeys[leadCounter] === githubUser) {
          // Return all leads
          return Object.values(users.Leads);
        }
        leadCounter++;
      }
      // If GitHub user not found in lead or member groups
      // The user must be in a different group
      selectedTeamTypeCounter++;
    }
    // User not found in General Team (DevTeam), look at antoher team
    teamCounter++;
  }

  return [];
}
