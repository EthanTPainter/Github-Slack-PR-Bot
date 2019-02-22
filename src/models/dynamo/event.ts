import { SlackUser } from "../slack";

export class Event {
  user: SlackUser;
  action: string;
}
