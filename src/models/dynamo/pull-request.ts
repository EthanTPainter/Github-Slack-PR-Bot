import { SlackUser } from "../slack";
import { Event } from "./event";

export class PullRequest {
  owner: SlackUser;
  title: string;
  url: string;
  members_alert: string[];
  leads_alert: string[];
  member_complete: boolean;
  members_approving: string[];
  lead_complete: boolean;
  leads_approving: string[];
  events: Event[];
}
