import * as querystring from "querystring";
import { requiredEnvs } from "../required-envs";
import * as AWS from "aws-sdk";
import { newLogger } from "../logger";
import { XRayInitializer } from "../xray";
import { SlashResponse, SNSParams } from "../models";

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
): Promise<SlashResponse> {

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

  // Add custom-source property to body
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
  const snsParams = new SNSParams(newBody, requiredEnvs.SNS_ARN);

  // Publish params to SNS or catch error
  try {
    await sns.publish(snsParams).promise();
    return new SlashResponse(`Successfully processed request`, 200);
  }
  catch (error) {
    return new SlashResponse(`Failed processing request`, 200);
  }
}
