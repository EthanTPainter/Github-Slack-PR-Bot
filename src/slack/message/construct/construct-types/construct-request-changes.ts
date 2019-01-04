import { RequestChangesPR } from "../../../../models";
import { Base, RequestChanges } from "../formatting";

export function constructReqChanges(event: any): RequestChangesPR {
  const reqChanges: RequestChanges = new RequestChanges();
  const base: Base = new Base();

  try {
    // RequestChangesPR properties
    const owner: string = reqChanges.getOwner(event);
    const userRequesting: string = reqChanges.getRequestingUser(event);

    // Use owner and userRequesting to get Slack names
    const slackUser: string = base.getSlackUser(owner);
    const slackUserRequest: string = base.getSlackUser(userRequesting);

    // Base Properties
    const description: string = reqChanges.constructDescription(slackUser, slackUserRequest);
    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

    // Construct RequestChangesPR object to return
    const changesObj: RequestChangesPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_requesting_changes: userRequesting,
    };

    return changesObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
