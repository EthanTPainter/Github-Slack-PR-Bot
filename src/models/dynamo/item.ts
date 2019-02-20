import { SlackUser } from "../slack";

export class Item {
  owner: SlackUser;
  title: string;
  url: string;
  MemberComplete: boolean;
  MembersApproving: string[];
  leadComplete: boolean;
  leadsApproving: string[];
  records: {
    actions?: [{
      user: SlackUser,
      action: string;
    }],
    times: string[],
  };
}
