import { TeamOptions } from "./team-options";
import { SlackUser } from "../slack";

export type JSONConfig = {
	Departments: {
		[department: string]: {
			[team: string]: {
				Options: TeamOptions;
				Slack_Group?: SlackUser;
				Users: {
					Leads: {
						[gitHubName: string]: SlackUser;
					};
					Members: {
						[githubName: string]: SlackUser;
					};
				};
			};
		};
	};
};
