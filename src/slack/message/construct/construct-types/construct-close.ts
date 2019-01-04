import { ClosePR } from "../../../../models";
import { Base, Close } from "../formatting";

export function constructClose(event: any): ClosePR {
  const base: Base = new Base();
  const close: Close = new Close();

  try {
    // ClosePR properties
    // GitHub user name who opened PR and GtHub user who closed the PR
    const owner: string = close.getOwner(event);
    const user_closing: string = close.getUserClosingPR(event);

    // Use owner variable to grab Slack name and group
    const slackUser: string = base.getSlackUser(owner);
    const groupName: string = base.getSlackGroup(owner);

    // Base properties
    let description: string;
    if (groupName === "") {
      description = close.constructDescription(slackUser);
    } else {
      description = close.constructDescription(slackUser, groupName);
    }
    const title: string = base.getTitle(event);
    const pr_url: string = base.getPRLink(event);

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
