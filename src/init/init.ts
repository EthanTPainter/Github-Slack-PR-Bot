import { json } from "./singlecomm";
import { DynamoReset } from "../dynamo/api";
import { requiredEnvs } from "../required-envs";
import { SlackUser } from "../../src/models";

/**
 * @description Initialize Dynamo table for all users.
 * Adds users and sets queue to an empty array.
 */
console.log(`Starting Dynamo Table initialization process...`);

async function dynamoTableInit(): Promise<void> {
	const dynamoReset = new DynamoReset();
	// For each department
	Object.keys(json.Departments).forEach((department) => {
		console.log(`Processing department: ${department}`);

		// For each team in the department
		Object.keys(json.Departments[department]).forEach(async (team) => {
			console.log(`Processing team: ${team}`);
			const slackGroup = json.Departments[department][team].Slack_Group;

			// Slack Group may not exist because it's not required
			if (slackGroup) {
				console.log(`Creating entry for Slack Group: ${slackGroup.Slack_Name}`);
				await dynamoReset.resetQueue(
					requiredEnvs.DYNAMO_TABLE_NAME,
					slackGroup,
				);
			}

			// For each lead in the team
			Object.keys(json.Departments[department][team].Users.Leads).forEach(
				async (lead) => {
					const leadObject: SlackUser =
						json.Departments[department][team].Users.Leads[lead];
					console.log(`Creating entry for Lead: ${leadObject.Slack_Name}`);
					await dynamoReset.resetQueue(
						requiredEnvs.DYNAMO_TABLE_NAME,
						leadObject,
					);
				},
			);

			// For each member in the team
			Object.keys(json.Departments[department][team].Users.Members).forEach(
				async (member) => {
					const memberObject: SlackUser =
						json.Departments[department][team].Users.Members[member];
					console.log(`Creating entry for Member: ${memberObject.Slack_Name}`);
					await dynamoReset.resetQueue(
						requiredEnvs.DYNAMO_TABLE_NAME,
						memberObject,
					);
				},
			);
		});
	});
}

dynamoTableInit();
