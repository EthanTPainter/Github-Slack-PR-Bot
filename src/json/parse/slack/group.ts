import { newLogger } from "../../../logger";
import { SlackUser } from "./../../../models";

const logger = newLogger("Group");

/**
 * @author Ethan T Painter
 * @description Retrieve the slack group from the GitHub user
 * @param {string} githubUser String of the GitHub user name
 * @returns String of the Slack group corresponding to the
 *          Github user provided
 * @note Group must exist, so return error if not
 */
export function getSlackGroup(
  githubUser: string,
  json: any,
): SlackUser {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDepartmentKeys.length === 0) {
    // (DevTeam, ThisCoolTeam, etc.)
    throw new Error("No Department found in JSON file");
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
      throw new Error("No Team found in JSON file");
    }
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamCounter < teamKeys.length) {
      // Retrieve users and groups from JSON
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
      const group = selectedTeam.Slack_Group;
      // If group doesn't exist in JSON, skip group
      if (group === undefined) {
        selectedTeamCounter = teamKeys.length;
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
        selectedTeamCounter++;
      }
    }
    // User not found in General Team (DevTeam), look at antoher team
    departmentCounter++;
  }
  throw new Error("No Slack Group found in JSON file");
}

/**
 * @author Ethan T Painter
 * @description Retrieve the slack group from the GitHub user
 * @param {string} slackUser String of the Slack user name
 * @returns String of the Slack group corresponding to the
 *          Slack user provided
 * @note Group must exist, so return error if not
 */
export function getSlackGroupAlt(
  slackUser: string,
  json: any,
): SlackUser {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const teams = json.Teams;
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
          if (leadKeys[leadCounter].includes(slackUser)) {
            logger.debug(`Found Github user ${slackUser}. Slack group: ${group}`);
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
          if (memberKeys[memberCounter].includes(slackUser)) {
            logger.debug(`Found GitHub user ${slackUser}. Slack group: ${group}`);
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
  throw new Error("No Slack Group found in JSON file");
}
