import { newLogger } from "../../logger";
import { updateOpen } from "./types/update-open";
import { getSlackUser, getSlackGroup } from "src/json/parse";

const logger = newLogger("UpdateDynamo");

/**
 * @description Update DynamoDB table
 * @param slackUser Slack User ID
 * @param json JSON for GitHub/Slack config
 */
export async function updateDynamo(
  githubUser: string,
  event: any,
  json: any,
  action: any,
): Promise<void> {

  const slackUser = getSlackUser(githubUser, json);
  const slackGroup = getSlackGroup(githubUser, json);

  switch (action) {

    case "opened": {
      logger.info("Update DynamoDB for an Opened PR");

      try {
        await updateOpen(slackUser, slackGroup, event, json);
      }
      catch (error) {
        throw new Error(error.message);
      }

      break;
    }

    case "reopened": {
      logger.info("Update DynamoDB for a Reopened PR");
      break;
    }

    case "closed": {
      const decider: boolean = event.pull_request.merged;
      if (decider) {
        logger.info("Update DynamoDB for a Merged PR");
      }
      else {
        logger.info("Update DynamoDB for a Closed PR");
      }
      break;
    }

    case "submitted": {
      const decider: string = event.review.state;
      if (decider === "approved") {
        logger.info("Update DynamoDB for an Approved PR");
      }
      else if (decider === "changes_requested") {
        logger.info("Update DynamoDB for a changes requested PR");
      }
      else if (decider === "commented") {
        logger.info("Update DynamoDB for a Commented PR");
      }
      else {
        throw new Error(`Unsupported event.review.state: ${decider}`);
      }
      break;
    }

    default: {
      const unsupportedEventType = `event action ${action} not supported in this application`;
      throw new Error(unsupportedEventType);
    }
  }
}
