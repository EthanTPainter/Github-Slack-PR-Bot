import { SlackUser } from "../slack";
import { Event } from "./event";

export type PullRequest = {
  owner: SlackUser;
  title: string;
  url: string;
  comment_times: { [slackUserID: string]: string };
  standard_members_alert: SlackUser[];
  standard_leads_alert: SlackUser[];
  req_changes_members_alert: SlackUser[];
  req_changes_leads_alert: SlackUser[];
  member_complete: boolean;
  lead_complete: boolean;
  members_approving: SlackUser[];
  leads_approving: SlackUser[];
  members_req_changes: SlackUser[];
  leads_req_changes: SlackUser[];
  events: Event[];
}
