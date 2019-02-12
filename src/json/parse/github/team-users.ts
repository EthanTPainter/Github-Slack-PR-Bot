
/**
 * @author Ethan T Painter
 * @description Retrieve a list of github users in a team
 * @param {string} githubUser GitHub username registered to a team
 * @param json JSON file for the GitHub/Slack configuration
 * @returns Array of github usernames (strings)
 */
export function getGitHubTeamUsers(
  githubUser: string,
  json: any,
): string[] {

  let githubUsers: string[];
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no departments present, return error
  if (allDepartmentKeys.length === 0) {
    throw new Error("No Department found in JSON file");
  }

  // Otherwise loop through departments (DevTeam, QaTeam, ProdTeam)
  let departmentCounter = 0;
  while (departmentCounter < allDepartmentKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedDepartmentName = allDepartmentKeys[departmentCounter];
    const selectedDepartment = departments[selectedDepartmentName];
    const teamKeys = Object.keys(selectedDepartment);
    if (teamKeys.length === 0) {
      throw new Error("No Team found in JSON file");
    }
    let selectedTeamCounter = 0;
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamCounter < teamKeys.length) {
      // Retrieve users from JSON
      const selectedTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const users = selectedTeam.Users;

      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const leadUsers = users.Leads;

      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const memberUsers = users.Members;
      // Check if githubUser is a Lead for the group
      // There may exist multiple users in Lead json
      const leadKeys = Object.keys(leadUsers);
      let leadCounter = 0;
      // Loop through lead keys for matching GitHub User
      while (leadCounter < leadKeys.length) {
        // Check if key matches GitHub user
        if (leadKeys[leadCounter] === githubUser) {
          githubUsers = Object.keys(leadUsers);
          githubUsers = githubUsers.concat(Object.keys(memberUsers));
          return githubUsers;
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
          githubUsers = Object.keys(leadUsers);
          githubUsers = githubUsers.concat(Object.keys(memberUsers));
          return githubUsers;
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
  // Looped through all departments and couldn't find github user
  // Throw error because of user not found
  throw new Error(`GitHub user: ${githubUser} could not be found in JSON file`);
}
