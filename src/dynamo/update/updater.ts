import { newLogger } from "../../logger";
import { updateOpen } from "./types/update-open";
import { getSlackUser, getSlackGroup } from "../../json/parse";
import { updateClose, updateMerge, updateApprove, updateReqChanges } from "./types";
import { getSender } from "../../github/parse";
import { updateComment } from "./types/update-comment";
import { requiredEnvs } from "../../required-envs";

const logger = newLogger("Updater");

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
): Promise<boolean> {

  const slackUserOwner = getSlackUser(githubUser, json);
  const slackGroupOwner = getSlackGroup(githubUser, json);

  switch (action) {

    case "opened": {
      logger.info("Update DynamoDB for an Opened PR");
      const resp = await updateOpen(
        slackUserOwner,
        slackGroupOwner,
        requiredEnvs.DYNAMO_TABLE_NAME,
        event,
        json);
      return resp;
    }

    case "reopened": {
      logger.info("Update DynamoDB for a Reopened PR");
      const resp = await updateOpen(
        slackUserOwner,
        slackGroupOwner,
        requiredEnvs.DYNAMO_TABLE_NAME,
        event,
        json);
      return resp;
    }

    case "closed": {
      const decider: boolean = event.pull_request.merged;
      const githubUserSender = getSender(event);
      const slackUserSender = getSlackUser(githubUserSender, json);

      if (decider) {
        logger.info("Update DynamoDB for a Merged PR");
        const resp = await updateMerge(
          slackUserOwner,
          slackUserSender,
          requiredEnvs.DYNAMO_TABLE_NAME,
          event,
          json);
        return resp;
      }
      else {
        logger.info("Update DynamoDB for a Closed PR");
        const resp = await updateClose(
          slackUserOwner,
          slackUserSender,
          requiredEnvs.DYNAMO_TABLE_NAME,
          event,
          json);
        return resp;
      }
    }

    case "submitted": {
      const decider: string = event.review.state;
      const githubUserSender = getSender(event);
      const slackUserSender = getSlackUser(githubUserSender, json);

      if (decider === "approved") {
        logger.info("Update DynamoDB for an Approved PR");
        const resp = await updateApprove(
          slackUserOwner,
          slackUserSender,
          requiredEnvs.DYNAMO_TABLE_NAME,
          event,
          json);
        return resp;
      }
      else if (decider === "changes_requested") {
        logger.info("Update DynamoDB for a changes requested PR");
        const resp = await updateReqChanges(
          slackUserOwner,
          slackUserSender,
          requiredEnvs.DYNAMO_TABLE_NAME,
          event,
          json);
        return resp;
      }
      else if (decider === "commented") {
        logger.info("Update DynamoDB for a Commented PR");
        const resp = await updateComment(
          slackUserOwner,
          slackUserSender,
          requiredEnvs.DYNAMO_TABLE_NAME,
          event,
          json);
        return resp;
      }
      else {
        throw new Error(`Unsupported event.review.state: ${decider}`);
      }
    }

    default: {
      logger.error(`event action: ${action} not supported in this application`);
      return false;
    }
  }
}
