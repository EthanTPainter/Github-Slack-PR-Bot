import { OpenedPR } from "../../../../models";
import { Base, Open } from "../formatting";

export function constructOpen(event: any): OpenedPR {
  try {
    const open: Open = new Open();
    const base: Base = new Base();

    // OpenedPr Properties
    // GitHub user name
    const owner: string = open.getOwner(event);

    // Use owner variable to grab Slack name and group
    const slackUser: string = base.getSlackUser(owner);
    const groupName: string = base.getSlackGroup(owner);

    // Base Properties
    let description: string;
    if (groupName === "") {
      description = open.constructDescription(slackUser);
    } else {
      description = open.constructDescription(slackUser, groupName);
    }
    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

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
