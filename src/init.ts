import { json } from "./json/src/real-example";
import { DynamoReset } from "./dynamo/api";
import { requiredEnvs } from "./required-envs";

/**
 * @description Initialize Dynamo table for all users.
 * Adds users and sets queue to an empty array.
 */
console.log(`Beginning Dynamo Table initialization process...`);

async function dynamoTableInit(): Promise<void> {
  const dynamoReset = new DynamoReset();
  Object.keys(json.Departments).forEach(department => {
    console.log(`Processing department: ${department}`);
    Object.keys(json.Departments[department]).forEach(async team => {
      console.log(`Processing team: ${team}`);
      const slackGroup = json.Departments[department][team].Slack_Group;
      console.log(`Creating entry for Slack Group: ${slackGroup.Slack_Id}`);
      await dynamoReset.resetQueue(requiredEnvs.DYNAMO_TABLE_NAME, slackGroup.Slack_Id);
      Object.keys(json.Departments[department][team].Users.Leads).forEach(async lead => {
        const leadObject = json.Departments[department][team].Users.Leads[lead];
        console.log(`Creating entry for Lead: ${leadObject.Slack_Id}`);
        await dynamoReset.resetQueue(requiredEnvs.DYNAMO_TABLE_NAME, leadObject.Slack_Id);
      });
      Object.keys(json.Departments[department][team].Users.Members).forEach(async member => {
        const memberObject = json.Departments[department][team].Users.Members[member];
        console.log(`Creating entry for Member: ${memberObject.Slack_Id}`);
        await dynamoReset.resetQueue(requiredEnvs.DYNAMO_TABLE_NAME, memberObject.Slack_Id);
      });
    });
  });
}

dynamoTableInit();
