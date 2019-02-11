import { SlackUser } from "../slack";

export class Item {
  owner: SlackUser;
  title: string;
  url: string;
  peerComplete: boolean;
  peersApproving: string[];
  leadComplete: boolean;
  leadsApproving: string[];
}
