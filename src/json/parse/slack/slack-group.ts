import json from "../../src/user-groups.json";

/**
 * @author Ethan T Painter
 * @description Retrieve the slack group from the GitHub user
 * @param githubUser String of the GitHub user name
 * @returns String of the Slack group corresponding to the
 *          Github user provided
 * @note Group may not exist (optional), so return empty string
 *       if it doesn't exist
 */
export function getSlackGroup(githubUser: string): string {
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
        const leadUsers: any = users.Leads;
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
