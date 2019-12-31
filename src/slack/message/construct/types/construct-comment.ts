import {
	getOwner,
	getSender,
	getTitle,
	getPRLink,
} from "../../../../github/parse";

import { CommentPR, JSONConfig } from "../../../../models";
import { getSlackUser } from "../../../../json/parse";
import { constructCommentDesc } from "../description";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructClose");

export function constructComment(event: any, json: JSONConfig): CommentPR {
	// Comment Properties
	const owner = getOwner(event);
	const user_commenting = getSender(event);

	// Grab Slack name
	const slackUser = getSlackUser(owner, json);
	const slackCommenter = getSlackUser(user_commenting, json);

	// Base Properties
	const description = constructCommentDesc(slackUser, slackCommenter);
	const title = getTitle(event);
	const url = getPRLink(event);

	// Construct CommentPR object
	const commentObj: CommentPR = {
		description,
		title,
		url,
		owner,
		user_commenting,
	};

	logger.debug(`CommentPR: ${JSON.stringify(commentObj)}`);

	return commentObj;
}
