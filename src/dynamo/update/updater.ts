import { newLogger } from "../../logger";
import { updateOpen } from "./types/update-open";
import { getSlackUser, getSlackGroup } from "../../json/parse";
import { updateClose, updateMerge, updateApprove, updateReqChanges } from "./types";
import { getSender } from "src/github/parse";
import { updateComment } from "./types/update-comment";

const logger = newLogger("UpdateDynamo");

/**
 * @description Update DynamoDB table when a
 *              PR is merged
 * @param githubUser github user who owns the PR
 * @param event full event from GitHub webhook
 * @param json JSON config file
 * @param action pull request action passed through
 * @returns Void
 */
export async function updateDynamo(
  githubUser: string,
  event: any,
  json: any,
  action: string,
): Promise<void> {

  const slackUserOwner = getSlackUser(githubUser, json);
  const slackGroupOwner = getSlackGroup(githubUser, json);

  switch (action) {

    case "opened": {
      logger.info("Update DynamoDB for an Opened PR");
      await updateOpen(slackUserOwner, slackGroupOwner, event, json);
      break;
    }

    case "reopened": {
      logger.info("Update DynamoDB for a Reopened PR");
      await updateOpen(slackUserOwner, slackGroupOwner, event, json);
      break;
    }

    case "closed": {
      const decider: boolean = event.pull_request.merged;
      const githubUserSender = getSender(event);
      const slackUserSender = getSlackUser(githubUserSender, json);

      if (decider) {
        logger.info("Update DynamoDB for a Merged PR");
        await updateMerge(slackUserOwner, slackUserSender, event, json);
      }
      else {
        logger.info("Update DynamoDB for a Closed PR");
        await updateClose(slackUserOwner, slackUserSender, event, json);
      }
      break;
    }

    case "submitted": {
      const decider: string = event.review.state;
      const githubUserSender = getSender(event);
      const slackUserSender = getSlackUser(githubUserSender, json);

      if (decider === "approved") {
        logger.info("Update DynamoDB for an Approved PR");
        await updateApprove(slackUserOwner, slackUserSender, event, json);
      }
      else if (decider === "changes_requested") {
        logger.info("Update DynamoDB for a changes requested PR");
        await updateReqChanges(slackUserOwner, slackUserSender, event, json);
      }
      else if (decider === "commented") {
        logger.info("Update DynamoDB for a Commented PR");
        await updateComment(slackUserOwner, slackUserSender, event, json);
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
