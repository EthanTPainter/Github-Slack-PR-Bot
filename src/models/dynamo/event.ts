import { SlackUser } from "../slack";

export type Event = {
  user: SlackUser;
  action: string;
  time: string;
}
