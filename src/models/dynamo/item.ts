import { SlackUser } from "../slack";
import { Event } from "./event";

export class Item {
  owner: SlackUser;
  title: string;
  url: string;
  members_alert: string[];
  leads_alert: string[];
  member_complete: boolean;
  members_approving: string[];
  lead_complete: boolean;
  leads_approving: string[];
  records: {
    events: Event[],
    times: string[],
  };
}
