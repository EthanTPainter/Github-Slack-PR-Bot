import { CommentPR } from "../../../models";

export function constructComment(): CommentPR {

  try {
    // Base Properties
    const description: string = "";
    const title: string = "";
    const pr_url: string = "";

    // Comment Properties
    const owner: string = "";
    const user_commenting: string = "";

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
