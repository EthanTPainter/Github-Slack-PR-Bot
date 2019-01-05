import json from "../../src/user-groups.json";

/**
 * Not enough information about which team the user is in, so search all (for now)
 * @author Ethan T Painter
 * @description Given a GitHub user, find the corresponding Slack user in the JSON file
 * @param event Event received from the GitHub webhook
 * @returns String of the slack user corresponding to the Github user provided
 */
export function getSlackUser(githubUser: string): string {
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
