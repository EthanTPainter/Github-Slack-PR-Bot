import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "src/github/parsing";

import { RequestChangesPR } from "../../../../models";
import { getSlackUser } from "src/json/parse";
import { constructReqChangesDesc } from "../../formatting";

export function constructReqChanges(event: any): RequestChangesPR {

  try {
    // RequestChangesPR properties
    const owner: string = getOwner(event);
    const userRequesting: string = getSender(event);

    // Use owner and userRequesting to get Slack names
    const slackUser: string = getSlackUser(owner);
    const slackUserRequest: string = getSlackUser(userRequesting);

    // Base Properties
    const description: string = constructReqChangesDesc(slackUser, slackUserRequest);
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

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
