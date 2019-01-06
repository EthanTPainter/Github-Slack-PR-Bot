import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "../../../../github/parse";

import { CommentPR } from "../../../../models";
import { getSlackUser } from "../../../../json/parse";
import { constructCommentDesc } from "../../formatting";

export function constructComment(event: string, json: any): CommentPR {

  try {
    // Comment Properties
    const owner: string = getOwner(event);
    const user_commenting: string = getSender(event);

    // Use owner variable to grab Slack name
    const slackUser: string = getSlackUser(owner, json);
    // Use user commenting to grab Slack name
    const slackCommenter: string = getSlackUser(user_commenting, json);

    // Base Properties
    const description: string = constructCommentDesc(slackUser, slackCommenter);
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Construct CommentPR object
    const commentObj: CommentPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_commenting: user_commenting,
    };

    return commentObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
