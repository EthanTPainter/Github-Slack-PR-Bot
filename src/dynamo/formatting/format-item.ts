import { getTitle, getPRLink } from "../../github/parse";
import { Item, SlackUser } from "../../models";

/**
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
  const numReqMember = json.Options.Num_Required_Member_Approvals;
  const numReqLead = json.Options.Num_Required_Lead_Approvals;

  let MemberComplete = false;
  let leadComplete = false;

  if (numReqMember === 0) {
    MemberComplete = true;
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
    MemberComplete: MemberComplete,
    MembersApproving: [],
    leadComplete: leadComplete,
    leadsApproving: [],
    records: {
      times: [],
    },
  };

  return item;
}
