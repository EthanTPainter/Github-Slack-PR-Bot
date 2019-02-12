/**
 * Not enough information about which team the user is in, so search all (for now)
 * @author Ethan T Painter
 * @description Given a GitHub user, find the corresponding Slack user in the JSON file
 * @param event Event received from the GitHub webhook
 * @returns String of the slack user corresponding to the Github user provided
 */
export function getTeamName(
  githubUser: string,
  json: any,
): string {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDepartmentKeys.length === 0) {
    throw new Error("No Team found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let departmentCounter = 0;
  while (departmentCounter < allDepartmentKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedDepartmentName = allDepartmentKeys[departmentCounter];
    const selectedDepartment = departments[selectedDepartmentName];
    const teamKeys = Object.keys(selectedDepartment);
    let selectedTeamCounter = 0;
    if (teamKeys.length === 0) {
      // (Dev_Team_1, SomethingCool1, etc.)
      throw new Error("No Team Group found in JSON file");
    }
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamCounter < teamKeys.length) {
      // Retrieve users from JSON
      const selectedGroupSubTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedGroupSubTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const users = selectedGroupSubTeam.Users;

      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }

      const leadUsers = users.Leads;
      const memberUsers = users.Members;
      const memberKeys = Object.keys(memberUsers);
      const leadKeys = Object.keys(leadUsers);

      let leadCounter = 0;
      // Loop through lead keys for matching GitHub User
      while (leadCounter < leadKeys.length) {
        // Check if key matches GitHub user
        if (leadKeys[leadCounter] === githubUser) {
          return teamKeys[selectedTeamCounter];
        }
        leadCounter++;
      }

      // User not found in Lead group. Check member group
      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberKeys.length) {
        // Check if key matches GitHub user
        if (memberKeys[memberCounter] === githubUser) {
          return teamKeys[selectedTeamCounter];
        }
        memberCounter++;
      }

      // If GitHub user not found in lead or member groups
      // The user must be in a different group
      selectedTeamCounter++;
    }
    // User not found in General Team (DevTeam), look at antoher team
    departmentCounter++;
  }
  // Looped through all teams and couldn't find github user
  // Throw error because of user not found
  throw new Error(`GitHub user: ${githubUser} could not be found in JSON file`);
}
