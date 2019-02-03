import { newLogger } from "../../../logger";

const logger = newLogger("Group");

/**
 * @author Ethan T Painter
 * @description Retrieve the slack group from the GitHub user
 * @param {string} githubUser String of the GitHub user name
 * @returns String of the Slack group corresponding to the
 *          Github user provided
 * @note Group may not exist (optional), so return empty string
 *       if it doesn't exist
 */
export function getSlackGroup(githubUser: string,
                              json: any,
                            ): string {
  const jsonFile = json;
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = jsonFile.Teams;
  const allTeamKeys = Object.keys(teams);
  // If no teams present, return error
  if (allTeamKeys.length === 0) {
    // (DevTeam, ThisCoolTeam, etc.)
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
      // Retrieve users and groups from JSON
      const selectedGroupSubTeam = selectedTeamGroup[teamGroupKeys[selectedTeamTypeCounter]];
      if (selectedGroupSubTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }
      const users = selectedGroupSubTeam.Users;

      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }
      const leadUsers = users.Leads;

      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamGroupKeys[selectedTeamTypeCounter]}`);
      }
      const memberUsers = users.Members;
      const group = selectedGroupSubTeam.Slack_Group;
      // If group doesn't exist in JSON, skip group
      if (group === undefined) {
        selectedTeamTypeCounter = teamGroupKeys.length;
      } else {
        // Check if githubUser is a Lead for the group
        // There may exist multiple users in Lead json
        const leadKeys = Object.keys(leadUsers);
        let leadCounter = 0;
        // Loop through lead keys for matching GitHub User
        while (leadCounter < leadKeys.length) {
          // Check if key matches GitHub user
          if (leadKeys[leadCounter] === githubUser) {
            logger.debug(`Found Github user ${githubUser}. Slack group: ${group}`);
            return group;
          }
          leadCounter++;
        }

        // User not found in Lead group. Check member group
        const memberKeys = Object.keys(memberUsers);
        let memberCounter = 0;
        // Loop through member keys for matching GitHub User
        while (memberCounter < memberKeys.length) {
          // Check if key matches GitHub user
          if (memberKeys[memberCounter] === githubUser) {
            logger.debug(`Found GitHub user ${githubUser}. Slack group: ${group}`);
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
