import * as querystring from "querystring";
import { requiredEnvs } from "../required-envs";
import * as AWS from "aws-sdk";
import { newLogger } from "../logger";
import { XRayInitializer } from "../xray";

const logger = newLogger("SNSManager");
/**
 * @description Processes GitHub Webhook POST requests
 * and sends each through to an SNS for processing
 * @param event Lambda Event
 * @param context Lambda context
 * @param callback Lambda callback
 */
export async function processRequestToSNS(
  event: any,
  context: any,
  callback: any,
): Promise<void> {

  XRayInitializer.init({
    logger: logger,
    disable: requiredEnvs.DISABLE_XRAY,
    context: "GitHub-Slack-PR-Bot",
    service: "SNSManager",
  });

  // Determine if request is from Slack or GitHub
  let slackSource = false;
  const userAgent: string = event.headers["User-Agent"];
  if (userAgent.includes("Slackbot")) {
    slackSource = true;
  }

  // Add custom-source property to new body
  let newBody: any;
  if (slackSource) {
    const oldBody = querystring.parse(event.body);
    newBody = JSON.stringify({ "custom-source": "SLACK", ...oldBody });
  }
  else {
    const oldBody = JSON.parse(event.body);
    newBody = JSON.stringify({ "custom-source": "GITHUB", ...oldBody });
  }

  // SNS logic
  const sns = new AWS.SNS({ apiVersion: requiredEnvs.SNS_API_VERSION });
  const snsParams = {
    Message: newBody,
    TopicArn: requiredEnvs.SNS_ARN,
  };
  try {
    await sns.publish(snsParams).promise();
  }
  catch (error) {
    const failed = {
      body: `Failed processing request`,
      statusCode: 200,
    };
    callback(null, failed);
  }
  const success = {
    body: `Successfully processed request`,
    statusCode: 200,
  };
  callback(null, success);
}
