import { TeamOptions } from "../../models/json/team-options";
import { SlackUser } from "src/models";

/**
 * @description Get Team options from JSON config file
 * @param githubUser GitHub username
 * @param json JSON config file
 * @returns TeamOptions model
 */
export function getTeamOptions(
  githubUser: string,
  json: any,
): TeamOptions {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDepartmentKeys.length === 0) {
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

      // Retrieve Options
      const selectedTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedTeam.Options === undefined) {
        throw new Error(`No Options defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const options = selectedTeam.Options;

      // Retrieve Users
      if (selectedTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const users = selectedTeam.Users;

      // Retrieve Leads and Members
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
          return options;
        }
        leadCounter++;
      }

      // User not found in Lead group. Check member group
      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberKeys.length) {
        // Check if key matches GitHub user
        if (memberKeys[memberCounter] === githubUser) {
          return options;
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
  throw new Error(`GitHub user: ${githubUser} not found in JSON`);
}

/**
 * @description Get Team options from JSON config file
 * @param slackUser SlackUser model
 * @param json JSON config file
 * @returns TeamOptions model
 */
export function getTeamOptionsAlt(
  slackUser: SlackUser,
  json: any,
): TeamOptions {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDepartmentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDepartmentKeys.length === 0) {
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
      // Retrieve Options
      const selectedTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedTeam.Options === undefined) {
        throw new Error(`No Options defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const options = selectedTeam.Options;

      // Retrieve Users
      if (selectedTeam.Users === undefined) {
        throw new Error(`No Users defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      const users = selectedTeam.Users;

      // Retrieve Leads and Members
      if (users.Leads === undefined) {
        throw new Error(`Leads not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }
      if (users.Members === undefined) {
        throw new Error(`Members not defined for team: ${teamKeys[selectedTeamCounter]}`);
      }

      const leadUsers = users.Leads;
      const memberUsers = users.Members;
      const memberValues = Object.values(memberUsers);
      const leadValues = Object.values(leadUsers);

      let leadCounter = 0;
      // Loop through lead keys for matching SlackUser.Slack_Id
      while (leadCounter < leadValues.length) {
        const selectedLead: any = leadValues[leadCounter];
        if (selectedLead.Slack_Id === slackUser.Slack_Id
          && selectedLead.Slack_Name === slackUser.Slack_Name) {
            return options;
        }
        leadCounter++;
      }

      // User not found in Lead group. Check member group
      let memberCounter = 0;
      // Loop through member keys for matching SlackUser.Slack_Id
      while (memberCounter < memberValues.length) {
        const selectedMember: any = memberValues[memberCounter];
        if (selectedMember.Slack_Id === slackUser.Slack_Id
          && selectedMember.Slack_Name === slackUser.Slack_Name) {
            return options;
        }
        memberCounter++;
      }

      // If SlackUser not found in lead or member groups
      // The user must be in a different group
      selectedTeamCounter++;
    }
    // User not found in General Team (DevTeam), look at another team
    departmentCounter++;
  }
  // Looped through all departments and couldn't find SlackUser
  // Throw error because of SlackUser not found
  throw new Error(`Slack user id: ${slackUser.Slack_Id} not found in JSON`);
}
