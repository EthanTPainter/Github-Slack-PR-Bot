import { getTitle, getPRLink } from "../../github/parse";
import { Item, SlackUser } from "../../models";

/**
 * @author Ethan T Painter
 * @description Given inputs, format an
 *              Item able to insert into
 *              a DynamoDB table.
 * @param slackUser Slack User ID
 * @param event Event from GitHub
 * @param json JSON config file
 */
export function formatItem(
  slackUser: SlackUser,
  event: any,
  json: any,
): Item {

  // Get title & Url from event
  const title = getTitle(event);
  const htmlUrl = getPRLink(event);

  // Get Required Approvals Numbers
  const numReqPeer = json.Options.Num_Required_Peer_Approvals;
  const numReqLead = json.Options.Num_Required_Lead_Approvals;

  let peerComplete = false;
  let leadComplete = false;

  if (numReqPeer === 0) {
    peerComplete = true;
  }
  if (numReqLead === 0) {
    leadComplete = true;
  }

  // Format an item from the values
  // and variables saved above
  const item: Item  = {
    owner: slackUser,
    title: title,
    url: htmlUrl,
    peerComplete: peerComplete,
    peersApproving: [],
    leadComplete: leadComplete,
    leadsApproving: [],
  };

  return item;
}
