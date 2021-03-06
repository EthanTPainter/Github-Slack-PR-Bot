import {
	constructOpen,
	constructClose,
	constructComment,
	constructMerge,
	constructReqChanges,
	constructApprove,
	constructSynchronize,
} from "./types";

import { Review } from "../../../../src/github/api";
import { newLogger } from "../../../logger";
import { JSONConfig } from "../../../../src/models";
import { requiredEnvs } from "../../../../src/required-envs";

const logger = newLogger("Constructor");

/**
 * @description Main function for constructing the slack message
 * @param action Action from the event
 * @param event Event including pull_request, sender, etc.
 * @param json JSON file of the configuration settings
 * @returns String of the slack message to send to the team channel
 */
export async function constructSlackMessage(
	action: string,
	event: any,
	json: JSONConfig,
	reviewClass: Review,
	githubToken: string,
): Promise<string> {
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
			const openedSlackMessage =
				open.description + "\n" + open.title + "  [" + open.url + "]";
			logger.debug(`Opened Slack Message:\n ${openedSlackMessage}`);
			return openedSlackMessage;
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
			const reopenedSlackMessage =
				open.description + "\n" + open.title + "  [" + open.url + "]";
			logger.debug(`Reopened Slack Message:\n ${reopenedSlackMessage}`);
			return reopenedSlackMessage;
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
				const closedSlackMessage =
					merge.description + "\n" + merge.title + "  [" + merge.url + "]";
				logger.debug("Merged Slack Message:\n" + closedSlackMessage);
				return closedSlackMessage;
			} else {
				logger.info("Constructing Closed PR slack message...");
				// Construct ClosePR Object and format slack message
				const close = constructClose(event, json);
				/* Construct order of Opened PR Slack message
				 * SLACK MESSAGE APPEARANCE:
				 * -------------- DESCRIPTION --------------
				 * -------------- TITLE --------------------
				 * -------------- URL ----------------------
				 */
				const closedSlackMessage =
					close.description + "\n" + close.title + "  [" + close.url + "]";
				logger.debug("Closed Slack Message:\n" + closedSlackMessage);
				return closedSlackMessage;
			}
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
				if (!reviewClass) {
					throw new Error(`reviewClass parameter must be defined`);
				}
				const approve = await constructApprove(
					reviewClass,
					event,
					json,
					githubToken,
				);

				/* Construct order of Opened PR Slack message
				 * SLACK MESSAGE APPEARANCE:
				 * -------------- DESCRIPTION --------------
				 * ---------------- TITLE ------------------
				 * ----------------- URL -------------------
				 * --------------- MEMBER CHECK ------------
				 * --------------- LEAD CHECK --------------
				 */
				const approvedSlackMessage =
					approve.description +
					"\n" +
					approve.title +
					"  [" +
					approve.url +
					"] \n" +
					approve.approvals;
				logger.debug("Approved Slack Message:\n" + approvedSlackMessage);
				return approvedSlackMessage;
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
				const changesRequestedSlackMessage =
					changes.description +
					"\n" +
					changes.title +
					"  [" +
					changes.url +
					"]";
				logger.debug(
					"Requested Changes Slack Message:\n" + changesRequestedSlackMessage,
				);
				return changesRequestedSlackMessage;
			} else if (decider === "commented") {
				logger.info("Constructing commentPR slack message");
				/* When a user comments on a PR
				 * This could get a bit spammy so probably keep it short
				 * encourage using "request_changes" for many comments
				 * SLACK MESSAGE APPEARANCE:
				 * -------------- DESCRIPTION --------------
				 * -------------- URL ----------------------
				 */
				const comment = constructComment(event, json);
				const commentSlackMessage =
					comment.description +
					"\n" +
					comment.title +
					"  [" +
					comment.url +
					"]";
				logger.debug("Commented Slack Message:\n" + commentSlackMessage);
				return commentSlackMessage;
			} else {
				// Not approved or requested changes, throw error for unsupported state
				throw new Error(
					`Review submitted for PR. Unsupported event.review.state: ${decider}`,
				);
			}
		}

		/**
		 * When a comment is created on a PR
		 * Construct the slack message for a user commenting on a PR
		 */
		case "created": {
			if (event.comment) {
				logger.info(`Constructing commentPR slack message`);
				/* When a user comments on a PR
				 * This could get a bit spammy so probably keep it short
				 * encourage using "request_changes" for many comments
				 * SLACK MESSAGE APPEARANCE:
				 * -------------- DESCRIPTION --------------
				 * -------------- TITLE --------------------
				 * -------------- URL ----------------------
				 */
				const comment = constructComment(event, json);
				const commentSlackMessage =
					comment.description +
					"\n" +
					comment.title +
					"  [" +
					comment.url +
					"]";
				logger.debug(`Commented Slack Message:\n ${commentSlackMessage}`);
				return commentSlackMessage;
			}
			break;
		}

		case "synchronize": {
			// Verify that the event has a pull request attached to it
			if (event.pull_request) {
				logger.info(`Constructing a fresh approval slack message`);
				/* When a user pushes a commit to a PR
				 * SLACK MESSAGE APPEARANCE:
				 * ----------------DESCRIPTION--------------
				 * ----------------URL----------------------
				 */
				const push = await constructSynchronize(
					event,
					json,
					requiredEnvs.DYNAMO_TABLE_NAME,
				);
				// If the alert property is false, don't return a valid slack message
				if (push.alert === false) {
					return "";
				}
				// Create list of affected approving users
				const usersAffected: string[] = [];
				push.reset_approving_users.forEach((formerApprovingUser) => {
					usersAffected.push(formerApprovingUser.Slack_Id);
				});

				const synchronizeSlackMessage =
					push.description +
					"\n" +
					push.title +
					"[" +
					push.url +
					"]" +
					"\nPrevious Approving Users: " +
					usersAffected.toString();
				logger.debug(`Synchronize Slack Message:\n ${synchronizeSlackMessage}`);
				return synchronizeSlackMessage;
			}
			break;
		}

		default: {
			logger.error(`GitHub action: ${action} not supported`);
			return "";
		}
	}
	return "";
}
