import { OpenedPR } from "../../../../models";
import { getOwner, getTitle, getPRLink } from "src/github/parsing";
import { getSlackUser, getSlackGroup } from "src/json/parse";
import { constructOpenDesc } from "../../formatting";

export function constructOpen(event: any): OpenedPR {

  try {
    // OpenedPr Properties
    // GitHub user name
    const owner: string = getOwner(event);

    // Use owner variable to grab Slack name and group
    const slackUser: string = getSlackUser(owner);
    const groupName: string = getSlackGroup(owner);

    // Base Properties
    let description: string;
    if (groupName === "") {
      description = constructOpenDesc(slackUser);
    } else {
      description = constructOpenDesc(slackUser, groupName);
    }
    const title: string = getTitle(event);
    const pr_url: string = getPRLink(event);

    // Construct OpenPR object to return
    const openObj: OpenedPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
    };

    return openObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
