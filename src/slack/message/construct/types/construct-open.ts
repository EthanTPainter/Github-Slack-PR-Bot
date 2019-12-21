import { OpenedPR, JSONConfig } from "../../../../models";
import { getOwner, getTitle, getPRLink } from "../../../../github/parse";
import { getSlackUser, getSlackGroup } from "../../../../json/parse";
import { constructOpenDesc } from "../description";
import { newLogger } from "../../../../logger";

const logger = newLogger("ConstructOpen");

export function constructOpen(
  event: any,
  json: JSONConfig,
  newPR: boolean,
): OpenedPR {

  try {
    // OpenedPr Properties
    // GitHub user name
    const owner = getOwner(event);

    // Use owner variable to grab Slack name and group
    const slackUser = getSlackUser(owner, json);
    const groupName = getSlackGroup(owner, json);

    // Base Properties
    const description = constructOpenDesc(slackUser, groupName, newPR, json);
    const title = getTitle(event);
    const pr_url = getPRLink(event);

    // Construct OpenPR object to return
    const openObj: OpenedPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
    };

    logger.debug(`OpenPR: ${openObj}`);

    return openObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
