import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model for closing PR's
 *
 * user   - User who closed the PR
 * owner  - User who opened the PR
 */
export class ClosePR extends Base {
  owner: string;
  user: string;
}
