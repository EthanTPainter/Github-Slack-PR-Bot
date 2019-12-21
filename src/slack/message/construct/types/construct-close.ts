import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "../../../../github/parse";

import {
  getSlackUser,
} from "../../../../json/parse";

import { ClosePR, JSONConfig } from "../../../../models";
import { constructCloseDesc } from "../description";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructClose");

export function constructClose(
  event: any,
  json: JSONConfig,
): ClosePR {

  try {
    // GitHub user name who opened PR and GtHub user who closed the PR
    const owner: string = getOwner(event);
    const userClosing: string = getSender(event);

    // Grab Slack name for owner and user closing
    const slackUser = getSlackUser(owner, json);
    const slackUserClosing = getSlackUser(userClosing, json);

    // Base properties
    const description = constructCloseDesc(slackUser, slackUserClosing);
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Construct ClosePR object to return
    const closeObj: ClosePR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_closing: userClosing,
    };

    logger.debug(`ClosePR: ${JSON.stringify(closeObj)}`);

    return closeObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
