import { constructSlackMessage } from "./slack/message/construct/constructor";

/**
 * Handler receives webhook POST requests from GitHub repositories
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
 * @param event Event passed through
 * @param context Context of the request
 * @param callback Callback function for using if successfull or failed
 */

export function githubResponseHandler(
  event: any,
  context: any,
  callback: any,
): void {
  console.log(`Event: ${JSON.stringify(event)}`);

  // Grab body from event
  const body: any = JSON.parse(event.body);
  console.log(`Event body: ${JSON.stringify(body)}`);

  // Use action property to format the response
  const pullRequestAction: string = body.action;
  console.log(`Action Found: ${pullRequestAction}`);

  // Construct the Slack message based on PR action and body
  const slackMessage: string = constructSlackMessage(pullRequestAction, body);

  // Provide success statusCode/Message
  const success: object = {
    body: "Successfully retrieved event",
    statusCode: "200"};
  callback(null, success);
}
