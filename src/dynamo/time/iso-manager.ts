import { DateTime } from "luxon";
import { SlackUser, TeamOptions, PullRequest } from "src/models";

/**
 * @description Create ISO timestamp of current date & time
 */
export function createISO(): string {
  return DateTime.local().toISO();
}

/**
 * @description From ISO string, create DateTime object
 * @param isoTimestamp ISO 8601 string
 * @source https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#static-method-fromISO
 */
export function fromISO(isoTimestamp: string): DateTime {
  return DateTime.fromISO(isoTimestamp);
}

/**
 * @description Determine whether to record comment & send slack alert
 *              or ignore comment and not alert slack
 * @param currentTime current time (in ISO string format)
 * @param teamOptions team options for config
 * @param slackUserCommenting Slack User commenting on PR
 * @param pr Pull Request
 */
export function sendCommentSlackAlert(
  currentTime: string,
  teamOptions: TeamOptions,
  slackUserCommenting: SlackUser,
  pr: PullRequest,
): { alertSlack: boolean, pr: PullRequest } {
  // Setup
  const lastCommentedTime = pr.comment_times[slackUserCommenting.Slack_Id];
  let alertSlack = true;

  // If found a comment recorded on this PR, check timestamp
  if (lastCommentedTime) {
    // If Avoid_Slack_Comments set to 0, always alert
    if (teamOptions.Avoid_Comment_Alerts === 0) {
      alertSlack = true;
      pr.comment_times[slackUserCommenting.Slack_Id] = currentTime;
      return { alertSlack, pr };
    }
    // Otherwise Compare currentTime with lastCommentedTime
    else {
      const lastCommentDateTime = fromISO(lastCommentedTime);
      const currentDateTime = fromISO(currentTime);
      const timeDifference = currentDateTime.diff(lastCommentDateTime, "minutes");
      const diffMinutes = timeDifference.minutes;
      // If difference in minutes between comments is greater than
      // avoid comment alerts time, send slack notification & replace comment time
      if (diffMinutes > teamOptions.Avoid_Comment_Alerts) {
        alertSlack = true;
        pr.comment_times[slackUserCommenting.Slack_Id] = currentTime;
        return { alertSlack, pr };
      }
      // Otherwise don't alert slack
      alertSlack = false;
      return { alertSlack, pr };
    }
  }
  // No previous timestamp found. Create a comment time
  else {
    alertSlack = true;
    pr.comment_times[slackUserCommenting.Slack_Id] = currentTime;
    return { alertSlack, pr };
  }
}
