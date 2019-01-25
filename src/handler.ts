import { constructSlackMessage } from "./slack/message/construct/constructor";

/**
 * This handler does 2 things:
 * 1) Receives webhook POST requests from GitHub repositories
 *    && constructs slack messages to post in team slack channels
 * 2) Receives messages from Slack users sent to the Slack Bot,
 *    and responds with expected information from Dynamo
 *
 * PullRequestEvent - When a PR is opened, closed, or merged
 * https://developer.github.com/v3/activity/events/types/#pullrequestevent
 *
 * PullRequestReviewEvent - When a PR has requested changes
 * https://developer.github.com/v3/activity/events/types/#pullrequestreviewevent
 *
 * PullRequestReviewCommentEvent - When a PR has comments submitted
 * https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
 *
 * Slack Events API for Slack messaging with Bots
 * https://api.slack.com/events-api
 *
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 */

export function handler(
  event: any,
  context: any,
  callback: any,
): void {
  console.log(`Event: ${JSON.stringify(event)}`);

  // Grab body from event
  const body: any = JSON.parse(event.body);
  console.log(`Event body: ${JSON.stringify(body)}`);

  // Determine if Request is from GitHub or Slack
  if (body.action !== undefined) {
    // Use action property to format the response
    const pullRequestAction: string = body.action;
    console.log(`Action Found: ${pullRequestAction}`);

    // Construct the Slack message based on PR action and body
    const slackMessage: string = constructSlackMessage(pullRequestAction, body);

    // Provide success statusCode/Message
    const success: object = {
      body: "Successfully retrieved event",
      statusCode: "200",
    };
    callback(null, success);
  }
  else {
    const challenge = body.challenge;
    console.log("Challenge: ", challenge);

    const success: object = {
      body: body.challenge,
      statusCode: "200",
    };
    callback(null, success);
  }
}
