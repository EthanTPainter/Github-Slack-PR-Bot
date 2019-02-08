import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "../../../../github/parse";

import { RequestChangesPR } from "../../../../models";
import { getSlackUser } from "../../../../json/parse";
import { constructReqChangesDesc } from "../../formatting";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructReqChanges");

export function constructReqChanges(
  event: any,
  json: any,
): RequestChangesPR {

  try {
    // RequestChangesPR properties
    const owner: string = getOwner(event);
    const userRequesting: string = getSender(event);

    // Use owner and userRequesting to get Slack names
    const slackUser: string = getSlackUser(owner, json);
    const slackUserRequest: string = getSlackUser(userRequesting, json);

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

    logger.debug(`RequestChangesPR: ${JSON.stringify(changesObj)}`);

    return changesObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
