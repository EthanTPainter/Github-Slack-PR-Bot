import { newLogger } from "../../../logger";
import { SlackUser } from "../../../models";

const logger = newLogger("User");
/**
 * Not enough information about which team the user is in, so search all (for now)
 * @description Given a GitHub user, find the corresponding Slack user in the JSON file
 * @param githubUser Github username
 * @param json JSON configuration file
 * @returns String of the slack user corresponding to the Github user provided
 */
export function getSlackUser(
  githubUser: string,
  json: any,
): SlackUser {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDeploymentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDeploymentKeys.length === 0) {
    throw new Error("No Department found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let teamCounter = 0;
  while (teamCounter < allDeploymentKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedDepartmentName = allDeploymentKeys[teamCounter];
    const selectedDepartment = departments[selectedDepartmentName];
    const teamKeys = Object.keys(selectedDepartment);
    let selectedTeamCounter = 0;
    if (teamKeys.length === 0) {
      // (Dev_Team_1, SomethingCool1, etc.)
      throw new Error("No Team found in JSON file");
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
      selectedTeamCounter++;
    }
    // User not found in General Team (DevTeam), look at antoher team
    teamCounter++;
  }
  // Looped through all teams and couldn't find github user
  // Throw error because of user not found
  throw new Error(`GitHub user: ${githubUser} could not be found in JSON file`);
}

/**
 * Not enough information about which team the user is in, so search all (for now)
 * @description Given a GitHub user, find the corresponding Slack user in the JSON file
 * @param slackUserId Slack User Id (<@12345>)
 * @param json JSON configuration file
 * @returns String of the slack user corresponding to the Github user provided
 */
export function getSlackUserAlt(
  slackUserId: string,
  json: any,
): SlackUser {
  // Navigates through JSON file from top to down (DevTeam -> QaTeam -> ProdTeam)
  const departments = json.Departments;
  const allDeploymentKeys = Object.keys(departments);
  // If no teams present, return error
  if (allDeploymentKeys.length === 0) {
    throw new Error("No Department found in JSON file");
  }

  // Otherwise loop through teams (DevTeam, QaTeam, ProdTeam)
  let teamCounter = 0;
  while (teamCounter < allDeploymentKeys.length) {
    // Get selectedTeam (DevTeam), and get selectedTeamGroup (DevTeam1)
    const selectedDepartmentName = allDeploymentKeys[teamCounter];
    const selectedDepartment = departments[selectedDepartmentName];
    const teamKeys = Object.keys(selectedDepartment);
    let selectedTeamCounter = 0;
    if (teamKeys.length === 0) {
      // (Dev_Team_1, SomethingCool1, etc.)
      throw new Error("No Team found in JSON file");
    }
    // Loop through team groups (DevTeam1, DevTeam2, etc.)
    while (selectedTeamCounter < teamKeys.length) {
      // Retrieve users from JSON
      const selectedTeam = selectedDepartment[teamKeys[selectedTeamCounter]];
      if (selectedTeam.Users === undefined) {
        throw new Error(`Users not defined for team: ${teamKeys[selectedTeamCounter]}`);
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
      // Loop through lead keys for matching GitHub User
      while (leadCounter < leadKeys.length) {
        const lead = leadKeys[leadCounter];
        const selectedLead = leadUsers[lead];
        if (selectedLead.Slack_Id === slackUserId) {
          return selectedLead;
        }
        leadCounter++;
      }

      // User not found in Lead group. Check member group
      let memberCounter = 0;
      // Loop through member keys for matching GitHub User
      while (memberCounter < memberKeys.length) {
        const member = memberKeys[memberCounter];
        const selectedMember = memberUsers[member];
        if (selectedMember.Slack_Id === slackUserId) {
          return selectedMember;
        }
        memberCounter++;
      }

      // If GitHub user not found in lead or member groups
      // The user must be in a different group
      selectedTeamCounter++;
    }
    // User not found in General Team (DevTeam), look at antoher team
    teamCounter++;
  }
  // Looped through all teams and couldn't find github user
  // Throw error because of user not found
  throw new Error(`Slack user id: ${slackUserId} not found in JSON file`);
}
