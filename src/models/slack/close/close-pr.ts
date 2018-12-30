import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model for closing PR's
 *
 * owner          - User who opened the PR
 * user_closing   - User who closed the PR
 */
export class ClosePR extends Base {
  owner: string;
  user_closing: string;
}
