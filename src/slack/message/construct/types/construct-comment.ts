import { CommentPR } from "../../../../models";
import { Base, Comment } from "../formatting";

export function constructComment(event: string): CommentPR {
  const base: Base = new Base();
  const comment: Comment = new Comment();

  try {
    // Comment Properties
    const owner: string = comment.getOwner(event);
    const user_commenting: string = comment.getUserCommenting(event);

    // Use owner variable to grab Slack name
    const slackUser: string = base.getSlackUser(owner);
    // Use user commenting to grab Slack name
    const slackCommenter: string = base.getSlackUser(user_commenting);

    // Base Properties
    const description: string = comment.constructDescription(slackUser, slackCommenter);
    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

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
