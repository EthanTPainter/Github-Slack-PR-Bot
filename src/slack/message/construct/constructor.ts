import { OpenedPR, ClosePR } from "src/models";
import { constructOpen } from "./types/construct-open";
import { constructClose } from "./types/construct-close";

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

    // When a user comments on a PR
    // This could get a bit spammy so probably
    // encourage using "request_changes" for many comments
    case "commented": {
      slackMessage = "Yes";
      break;
    }

    // When a PR has been closed
    case "closed": {
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
      break;
    }

    // When a review has been submitted for a PR
    case "submitted": {
      // Determine if the PR was approved or changes were requested
      const decider: string = event.review.state;
      // If PR is approved, construct Approval checkmark
      if (decider === "approved") {
        slackMessage = "";
      }
      else if (decider === "changes_requested") {
        slackMessage = "";
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
