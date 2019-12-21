import { SSM } from "aws-sdk";
import { newLogger } from "../../src/logger";

const logger = newLogger("SSMRetriever");

export class SSMRetriever {
	private ssmClient: SSM;
	constructor(ssmApiVersion: string) {
		this.ssmClient = new SSM({ apiVersion: ssmApiVersion });
	}

	/**
	 * @description Given a parameter path, retrieve the corresponding value in SSM
	 * @param parameters Parameters to retrieve in AWS SSM
	 */
	async getValues(
		slackSSMParam: string,
		githubSSMParam: string,
	): Promise<{ Slack_Token: string; GitHub_Token: string }> {
		const params = {
			Names: [slackSSMParam, githubSSMParam],
			WithDecryption: true,
		};
		const response = await this.ssmClient.getParameters(params).promise();

		// If the response has invalid parameters
		if (response.InvalidParameters && response.InvalidParameters.length > 0) {
			logger.error(
				`Invalid Parameters: ${JSON.stringify(response.InvalidParameters)}`,
			);
			throw new Error(
				`Unable to detect parameters for slack and github tokens`,
			);
		}

		// If the response doesn't have both parameters
		if (
			!response.Parameters ||
			!response.Parameters[0] ||
			!response.Parameters[1]
		) {
			throw new Error(
				`Did not receive both slack and github parameters from SSM`,
			);
		}

		// If the response doesn't have values for both parameters
		if (!response.Parameters[0].Value || !response.Parameters[1].Value) {
			throw new Error(`Missing values for the retrieved SSM parameters`);
		}

		// If there are no invalid parameters, both parameters exist,
		// and both parameters have values, return the slack and github tokens
		// WARNING: Response may not have the parameters in the same order as passed in
		const tokens = {
			Slack_Token:
				response.Parameters[0].Name === slackSSMParam
					? response.Parameters[0].Value!
					: response.Parameters[1].Value!,
			GitHub_Token:
				response.Parameters[1].Name === githubSSMParam
					? response.Parameters[1].Value!
					: response.Parameters[0].Value!,
		};
		return tokens;
	}
}
