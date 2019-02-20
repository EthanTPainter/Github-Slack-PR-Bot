import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "../../../../github/parse";

import { CommentPR } from "../../../../models";
import { getSlackUser } from "../../../../json/parse";
import { constructCommentDesc } from "../description";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructClose");

export function constructComment(
  event: any,
  json: any,
): CommentPR {

  try {
    // Comment Properties
    const owner = getOwner(event);
    const user_commenting = getSender(event);

    // Grab Slack name
    const slackUser = getSlackUser(owner, json);
    const slackCommenter = getSlackUser(user_commenting, json);

    // Base Properties
    const description = constructCommentDesc(slackUser, slackCommenter);
    const title = getTitle(event);
    const pr_url = getPRLink(event);

    // Construct CommentPR object
    const commentObj: CommentPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_commenting: user_commenting,
    };

    logger.debug(`CommentPR: ${JSON.stringify(commentObj)}`);

    return commentObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
