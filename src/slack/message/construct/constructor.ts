import {
  constructOpen,
  constructClose,
  constructComment,
  constructMerge,
  constructReqChanges,
  constructApprove,
} from "./types";

import { Review } from "../../../../src/github/api";
import { newLogger } from "../../../logger";

const logger = newLogger("Constructor");

/**
 * @description Main function for constructing the slack message
 * @param action Action from the event
 * @param event Event including pull_request, sender, etc.
 * @returns String of the slack message to send to the team channel
 */
export async function constructSlackMessage(
  action: string,
  event: any,
  json: any,
  reviewClass?: Review,
): Promise<string> {

  let slackMessage = "default";

  switch (action) {
    /* When a PR is opened
     * Construct OpenPR Object and format slack message
     */
    case "opened": {
      logger.info("Constructing OpenPR slack message...");
      const newPR = true;
      const open = constructOpen(event, json, newPR);
      /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * -------------- TITLE --------------------
       * -------------- URL ----------------------
       */
      slackMessage = open.description + "\n"
        + open.title
        + "  [" + open.url + "]";
      logger.debug("Opened Slack Message:\n" + slackMessage);
      break;
    }

    /* When a PR is reopened (PR was previously CLOSED)
     * Construct OpenPR Object and format slack message
     */
    case "reopened": {
      logger.info("Constructing Reopened PR slack message...");
      const newPR = false;
      const open = constructOpen(event, json, newPR);
      /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * -------------- TITLE --------------------
       * -------------- URL ----------------------
       */
      slackMessage = open.description + "\n"
                      + open.title
                      + "  [" + open.url + "]";
      logger.debug("Reopened Slack Message:\n" + slackMessage);
      break;
    }

    /* When a PR has been closed OR merged
     * Determine if the PR was approved or changes were requested
     * Construct MergedPR Object and format slack message
     */
    case "closed": {
      const decider: boolean = event.pull_request.merged;
      if (decider) {
        logger.info("Constructing Merged PR slack message...");
        const merge = constructMerge(event, json);
        /* Construct order of Opened PR Slack message
         * SLACK MESSAGE APPEARANCE:
         * -------------- DESCRIPTION --------------
         * -------------- TITLE --------------------
         * -------------- URL ----------------------
         */
        slackMessage = merge.description + "\n"
                        + merge.title
                        + "  [" + merge.url + "]";
        logger.debug("Merged Slack Message:\n" + slackMessage);
      }
      else {
        logger.info("Constructing Closed PR slack message...");
        // Construct ClosePR Object and format slack message
        const close = constructClose(event, json);
        /* Construct order of Opened PR Slack message
        * SLACK MESSAGE APPEARANCE:
        * -------------- DESCRIPTION --------------
        * -------------- TITLE --------------------
        * -------------- URL ----------------------
        */
        slackMessage = close.description + "\n"
                        + close.title
                        + "  [" + close.url + "]";
        logger.debug("Closed Slack Message:\n" + slackMessage);
      }
      break;
    }

    /* When a review has been submitted for a PR
     * Determine if the PR was approved or changes were requested
     */
    case "submitted": {
      const decider: string = event.review.state;
      /* If PR is approved, construct Approval checkmark
       * When a user approves a PR. This is arguably the most important feat
       */
      if (decider === "approved") {
        logger.info("Constructing ApprovePR slack message...");
        if (reviewClass === undefined) {
          throw new Error("reviewClass parameter must be defined");
        }
        const approve = await constructApprove(reviewClass, event, json);

        /* Construct order of Opened PR Slack message
         * SLACK MESSAGE APPEARANCE:
         * -------------- DESCRIPTION --------------
         * ---------------- TITLE ------------------
         * ----------------- URL -------------------
         * --------------- PEER CHECK --------------
         * --------------- LEAD CHECK --------------
         */
        slackMessage = approve.description + "\n"
                        + approve.title
                        + "  [" + approve.url + "] \n"
                        + approve.approvals;
        logger.debug("Approved Slack Message:\n" + slackMessage);
      }
      // When a user requests changes on a PR. This is arguably the most important feat
      else if (decider === "changes_requested") {
        logger.info("Constructing ReqChangesPR slack message...");
        const changes = constructReqChanges(event, json);
        /* Construct order of Opened PR Slack message
         * SLACK MESSAGE APPEARANCE:
         * -------------- DESCRIPTION --------------
         * -------------- TITLE --------------------
         * -------------- URL ----------------------
         */
        slackMessage = changes.description + "\n"
                        + changes.title
                        + "  [" + changes.url + "]";
        logger.debug("Requested Changes Slack Message:\n" + slackMessage);
      }
      else if (decider === "commented") {
        logger.info("Constructing commentPR slack message");
        /* When a user comments on a PR
         * This could get a bit spammy so probably keep it short
         * encourage using "request_changes" for many comments
          * SLACK MESSAGE APPEARANCE:
          * -------------- DESCRIPTION --------------
          * -------------- URL ----------------------
         */
        const comment = constructComment(event, json);
        slackMessage = comment.description + "\n"
                        + comment.title
                        + "  [" + comment.url + "]";
        logger.debug("Commented Slack Message:\n" + slackMessage);
      }
      else {
        // Not approved or requested changes, throw error for unsupported state
        throw new Error(`Review submitted for PR. Unsupported event.review.state: ${decider}`);
      }
      break;
    }

    default: {
      const unsupportedEventType = `event action ${action} not supported in this application`;
      slackMessage = unsupportedEventType;
      throw new Error(slackMessage);
    }
  }
  return slackMessage;
}
