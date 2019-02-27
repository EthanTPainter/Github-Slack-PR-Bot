import { getTitle, getPRLink } from "../../github/parse";
import { Item, SlackUser } from "../../models";
import { getTeamOptionsAlt, getSlackMembersAlt, getSlackUsersAlt, getSlackLeadsAlt } from "../../json/parse";

/**
 * @description Given inputs, format an
 *              Item able to insert into
 *              a DynamoDB table.
 * @param slackUser Slack User
 * @param event Event from GitHub
 * @param json JSON config file
 */
export function formatItem(
  slackUser: SlackUser,
  event: any,
  json: any,
): Item {

  // Get title & url from event
  const title = getTitle(event);
  const htmlUrl = getPRLink(event);

  // Get Required Approvals Numbers
  const teamOptions = getTeamOptionsAlt(slackUser, json);
  const numReqMember = teamOptions.Num_Required_Member_Approvals;
  const numReqLead = teamOptions.Num_Required_Lead_Approvals;

  let memberComplete = false;
  let leadComplete = false;

  if (numReqMember === 0) {
    memberComplete = true;
  }
  if (numReqLead === 0) {
    leadComplete = true;
  }

  const allTeamMembers = getSlackMembersAlt(slackUser, json);
  const removeMemberOwner = allTeamMembers.filter((member: SlackUser) => member.Slack_Id !== slackUser.Slack_Id);
  const memberIds = removeMemberOwner.map((member: SlackUser) => member.Slack_Id );

  const allTeamLeads = getSlackLeadsAlt(slackUser, json);
  const removeLeadOwner = allTeamLeads.filter((lead: SlackUser) => lead.Slack_Id !== slackUser.Slack_Id);
  const leadIds = removeLeadOwner.map((lead: SlackUser) => lead.Slack_Id);

  // Format an item from the values
  // and variables saved above
  const item: any = {
    owner: slackUser,
    title: title,
    url: htmlUrl,
    members_alert: memberIds,
    leads_alert: leadIds,
    member_complete: memberComplete,
    members_approving: [],
    lead_complete: leadComplete,
    leads_approving: [],
    records: {
      events: [],
      times: [],
    },
  };

  return item;
}
