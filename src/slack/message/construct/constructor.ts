
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

    case "opened": {
      slackMessage = "No";
      break;
    }

    case "commented": {
      slackMessage = "Yes";
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
