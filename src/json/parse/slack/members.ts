import { newLogger } from "../../../logger";
import { SlackUser } from "../../../models";

const logger = newLogger("Member");
/**
 * @description Using the GitHub username, find the
 *       group and retrieve the members for that group
 * @param githubUser GitHub username in JSON file
 * @returns array of slack members
 */
export function getSlackMembers(
  githubUser: string,
  json: any,
): SlackUser[] {
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
      const selectedTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const users = selectedTeam.Users;

      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }

      const leadUsers = users.Leads;
      const memberUsers = users.Members;
      const leadKeys = Object.keys(leadUsers);
      const memberKeys = Object.keys(memberUsers);

      let leadCounter = 0;
      while (leadCounter < leadKeys.length) {
        if (leadKeys[leadCounter] === githubUser) {
          logger.debug(`Found GitHub user ${githubUser}. Members: ${Object.values(memberUsers)}`);
          return Object.values(memberUsers);
        }
        leadCounter++;
      }

      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberKeys.length) {
        // Check if key matches GitHub user
        if (memberKeys[memberCounter] === githubUser) {
          logger.debug(`Found GitHub user ${githubUser}. Members: ${Object.values(memberUsers)}`);
          return Object.values(memberUsers);
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
  return [];
}

/**
 * @description Alternative Get Slack Member function.
 *              Instead of GitHub user, uses slack user
 * @param slackUser Slack user
 * @param json JSON config file
 * @returns Array of slack members
 */
export function getSlackMembersAlt(
  slackUser: SlackUser,
  json: any,
): SlackUser[] {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = json.Departments;
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
      const leadValues = Object.values(leadUsers);
      const memberValues = Object.values(memberUsers);

      let leadCounter = 0;
      while (leadCounter < leadValues.length) {
        if (leadValues[leadCounter] === slackUser) {
          logger.debug(`Found Slack user ${slackUser}. Members: ${Object.values(memberUsers)}`);
          return Object.values(memberUsers);
        }
        leadCounter++;
      }

      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberValues.length) {
        // Check if key matches GitHub user
        if (memberValues[memberCounter] === slackUser) {
          logger.debug(`Found Slack user ${slackUser}. Members: ${Object.values(memberUsers)}`);
          return Object.values(memberUsers);
        }
        memberCounter++;
      }
      selectedTeamTypeCounter++;
    }
    teamCounter++;
  }
  return [];
}
