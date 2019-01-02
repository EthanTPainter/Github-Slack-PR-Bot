import { OpenedPR, ClosePR, CommentPR, MergePR } from "src/models";
import { constructOpen } from "./types/construct-open";
import { constructClose } from "./types/construct-close";
import { constructComment } from "./types/construct-comment";
import { constructMerge } from "./types/construct-merge";

/*
 * @Author: Ethan T Painter
 * Basis for constructing a Slack message (First step)
 *
 * Note: The 'action' variable sometimes doesn't provide enough information
 *       by itself to determine whether a PR has been opened, approved, commented,
 *       etc. Additional properties on the event are necessary to check to be sure
 *       of the outcome I anticipate.
 */

 /**
  * @author Ethan T Painter
  * @description Main function for constructing the slack message
  * @param action Action from the event
  * @param event Event including pull_request, sender, etc.
  * @returns String of the slack message to send to the team channel
  */
export function constructSlackMessage(
  action: string,
  event: any,
): string {

  let slackMessage: string = "default";

  switch (action) {
    // When a PR is opened
    case "opened": {
      // Construct OpenPR Object and format slack message
      const open: OpenedPR = constructOpen(event);
      /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * -------------- TITLE --------------------
       * -------------- URL ----------------------
       */
      slackMessage = open.description + "\n"
                      + open.title + "\n"
                      + open.url;
      break;
    }

    // When a PR is reopened (PR was previously CLOSED)
    case "reopened": {
      // Construct OpenPR Object and format slack message
      const open: OpenedPR = constructOpen(event);
      /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * -------------- TITLE --------------------
       * -------------- URL ----------------------
       */
      slackMessage = open.description + "\n"
                      + open.title + "\n"
                      + open.url;
      break;
    }

    // When a PR has been closed OR merged
    case "closed": {
      // Determine if the PR was approved or changes were requested
      const decider: boolean = event.pull_request.merged;
      if (decider) {
        // Construct MergedPR Object and format slack message
        const merge: MergePR = constructMerge(event);
        /* Construct order of Opened PR Slack message
        * SLACK MESSAGE APPEARANCE:
        * -------------- DESCRIPTION --------------
        * -------------- TITLE --------------------
        * -------------- URL ----------------------
        */
        slackMessage = merge.description + "\n"
                        + merge.title + "\n"
                        + merge.url;
      }
      else {
        // Construct ClosePR Object and format slack message
        const close: ClosePR = constructClose(event);
        /* Construct order of Opened PR Slack message
        * SLACK MESSAGE APPEARANCE:
        * -------------- DESCRIPTION --------------
        * -------------- TITLE --------------------
        * -------------- URL ----------------------
        */
        slackMessage = close.description + "\n"
                        + close.title + "\n"
                        + close.url;
      }
      break;
    }

    // When a review has been submitted for a PR
    case "submitted": {
      // Determine if the PR was approved or changes were requested
      const decider: string = event.review.state;
      // If PR is approved, construct Approval checkmark
      if (decider === "approved") {
        // When a user approves a PR. This is arguably the most important feat
        /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * ---------------- TITLE ------------------
       * ----------------- URL -------------------
       * --------- PEER APPROVAL CHECK -----------
       * --------- LEAD APPROVAL CHECK -----------
       * ----------- CAN MERGE CHECK -------------
       */
        slackMessage = "";
      }
      else if (decider === "changes_requested") {
        // When a user requests changes on a PR. This is arguably the most important feat
        /* Construct order of Opened PR Slack message
       * SLACK MESSAGE APPEARANCE:
       * -------------- DESCRIPTION --------------
       * -------------- TITLE --------------------
       * -------------- URL ----------------------
       */
        slackMessage = "";
      }
      else if (decider === "commented") {
        // When a user comments on a PR
        // This could get a bit spammy so probably keep it short
        // encourage using "request_changes" for many comments
        const comment: CommentPR = constructComment(event);
        slackMessage = comment.description + "\n"
                        + comment.url;
      }
      else {
        // Not approved or requested changes, throw error for unsupported state
        throw new Error(`Review submitted for PR. Unsupported event.review.state: ${decider}`);
      }
      break;
    }

    case "default": {
      const unsupportedEventType: string = `event action ${event.action} not supported in this application`;
      slackMessage = unsupportedEventType;
      throw new Error(slackMessage);
    }
  }
  return slackMessage;
}
