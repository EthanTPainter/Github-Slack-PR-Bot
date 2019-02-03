import { newLogger } from "../../../logger";

const logger = newLogger("Lead");

/**
 * @author Ethan T Painter
 * @description Using the GitHub username, find the
 *       group and retrieve the leads for that group
 * @param githubUser GitHub username in JSON file
 * @returns array of Slack users
 */
export function getSlackLeads(githubUser: string,
                              json: any,
                            ): string[] {
  const jsonFile = json;
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = jsonFile.Teams;
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
      // Dev_Team_1, SomethingCool1, etc.
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
          logger.debug(`Found GitHub user ${githubUser}. Leads: ${Object.values(users.Leads)}`);
          return Object.values(users.Leads);
        }
        leadCounter++;
      }

      let memberCounter = 0;
      while (memberCounter < memberKeys.length) {
        if (memberKeys[memberCounter] === githubUser) {
          logger.debug(`Found GitHub user ${githubUser}. Leads: ${Object.values(users.Leads)}`);
          return Object.values(users.Leads);
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
  return [];
}
