import {
  getOwner,
  getSender,
  getTitle,
  getPRLink,
} from "src/github/parsing";

import {
  getSlackUser,
  getSlackGroup,
} from "src/json/parse";

import { ClosePR } from "../../../../models";
import { constructCloseDesc } from "../../formatting";

export function constructClose(event: any): ClosePR {

  try {
    // ClosePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    const owner: string = getOwner(event);
    const user_closing: string = getSender(event);

    // REMOVE JSON WITH REAL JSON FILE
    const json: any = {};

    // Use owner variable to grab Slack name and group
    const slackUser: string = getSlackUser(owner, json);
    const groupName: string = getSlackGroup(owner, json);

    // Base properties
    const description = constructCloseDesc(slackUser, groupName);
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Construct ClosePR object to return
    const closeObj: ClosePR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_closing: user_closing,
    };

    return closeObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
