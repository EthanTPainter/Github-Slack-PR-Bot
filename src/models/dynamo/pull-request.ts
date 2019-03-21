import { SlackUser } from "../slack";
import { Event } from "./event";

export class PullRequest {
  owner: SlackUser;
  title: string;
  url: string;
  standard_members_alert: string[];
  standard_leads_alert: string[];
  member_complete: boolean;
  lead_complete: boolean;
  members_approving: string[];
  leads_approving: string[];
  members_req_changes: string[];
  leads_req_changes: string[];
  events: Event[];
}
