import { newLogger } from "../../../logger";

const logger = newLogger("User");
/**
 * Not enough information about which team the user is in, so search all (for now)
 * @author Ethan T Painter
 * @description Given a GitHub user, find the corresponding Slack user in the JSON file
 * @param event Event received from the GitHub webhook
 * @returns String of the slack user corresponding to the Github user provided
 */
export function getSlackUser(
  githubUser: string,
  json: any,
): string {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = json.Teams;
  const allTeamKeys = Object.keys(teams);
  // If no teams present, return error
  if (allTeamKeys.length === 0) {
    throw new Error("No Team found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let teamCounter = 0;
  while (teamCounter < allTeamKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedTeam = allTeamKeys[teamCounter];
    const selectedTeamGroup = teams[selectedTeam];
    const teamGroupKeys = Object.keys(selectedTeamGroup);
    let selectedTeamTypeCounter = 0;
    if (teamGroupKeys.length === 0) {
      // (Dev_Team_1, SomethingCool1, etc.)
      throw new Error("No Team Group found in JSON file");
    }
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamTypeCounter < teamGroupKeys.length) {
      // Retrieve users from JSON
      const selectedGroupSubTeam = selectedTeamGroup[teamGroupKeys[selectedTeamTypeCounter]];
      if (selectedGroupSubTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }
      const users = selectedGroupSubTeam.Users;

      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }
      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }

      const leadUsers = users.Leads;
      const memberUsers = users.Members;
      const leadKeys = Object.keys(leadUsers);
      const memberKeys = Object.keys(memberUsers);

      let leadCounter = 0;
      // Loop through lead keys for matching GitHub User
      while (leadCounter < leadKeys.length) {
        // Check if key matches GitHub user
        if (leadKeys[leadCounter] === githubUser) {
          return leadUsers[githubUser];
        }
        leadCounter++;
      }

      // User not found in Lead group. Check member group
      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberKeys.length) {
        // Check if key matches GitHub user
        if (memberKeys[memberCounter] === githubUser) {
          return memberUsers[githubUser];
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
  throw new Error(`GitHub user: ${githubUser} could not be found in JSON file`);
}
