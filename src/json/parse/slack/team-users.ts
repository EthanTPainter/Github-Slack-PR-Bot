import { SlackUser } from "../../../models";

/**
 * @description Retrieve a list of slack users in a team
 * @param {string} githubUser GitHub username registered to a team
 * @param json JSON file for the GitHub/Slack configuration
 * @returns Array of github usernames (strings)
 */
export function getSlackUsers(
  githubUser: string,
  json: any,
): SlackUser[] {
  let slackUsers: SlackUser[];
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDepartmentKeys.length === 0) {
    throw new Error("No Team (DevTeam, ThisCoolTeam, etc.) found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let departmentCounter = 0;
  while (departmentCounter < allDepartmentKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedDepartmentName = allDepartmentKeys[departmentCounter];
    const selectedDepartment = departments[selectedDepartmentName];
    const teamKeys = Object.keys(selectedDepartment);
    if (teamKeys.length === 0) {
      throw new Error("No Team Group (Dev_Team_1, SomethingCool1, etc.) found in JSON file");
    }
    let selectedTeamCounter = 0;
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
          slackUsers = Object.values(leadUsers);
          slackUsers = slackUsers.concat(Object.values(memberUsers));
          return slackUsers;
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
          slackUsers = Object.values(leadUsers);
          slackUsers = slackUsers.concat(Object.values(memberUsers));
          return slackUsers;
        }
        memberCounter++;
      }
      selectedTeamCounter++;
    }
    departmentCounter++;
  }
  throw new Error(`GitHub user: ${githubUser} could not be found in JSON file`);
}

/**
 * @description Retrieve a list of slack users in a team
 * @param {string} slackUser Slack username registered to a team
 * @param json JSON file for the GitHub/Slack configuration
 * @returns Array of slack usernames (strings)
 */
export function getSlackUsersAlt(
  slackUserId: string,
  json: any,
): SlackUser[] {
  let slackUsers: SlackUser[];
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = json.Departments;
  const allTeamKeys = Object.keys(teams);
  // If no teams present, return error
  if (allTeamKeys.length === 0) {
    throw new Error("No Team (DevTeam, ThisCoolTeam, etc.) found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let teamCounter = 0;
  while (teamCounter < allTeamKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedTeam = allTeamKeys[teamCounter];
    const selectedTeamGroup = teams[selectedTeam];
    const teamGroupKeys = Object.keys(selectedTeamGroup);
    if (teamGroupKeys.length === 0) {
      throw new Error("No Team Group (Dev_Team_1, SomethingCool1, etc.) found in JSON file");
    }
    let selectedTeamTypeCounter = 0;
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamTypeCounter < teamGroupKeys.length) {
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
      const leadValues = Object.values(leadUsers);
      let leadCounter = 0;
      while (leadCounter < leadValues.length) {
        if (leadValues[leadCounter] === slackUserId) {
          slackUsers = Object.values(leadUsers);
          slackUsers = slackUsers.concat(Object.values(memberUsers));
          return slackUsers;
        }
        leadCounter++;
      }

      const memberValues = Object.values(memberUsers);
      let memberCounter = 0;
      while (memberCounter < memberValues.length) {
        if (memberValues[memberCounter] === slackUserId) {
          slackUsers = Object.values(leadUsers);
          slackUsers = slackUsers.concat(Object.values(memberUsers));
          return slackUsers;
        }
        memberCounter++;
      }
      selectedTeamTypeCounter++;
    }
    teamCounter++;
  }
  throw new Error(`Slack user: ${slackUserId} could not be found in JSON file`);
}
