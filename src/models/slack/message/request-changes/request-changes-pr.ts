import { Base } from "../base";

/*
 * @Author: Ethan T Painter
 * Model for when changes are requested in a PR
 *
 * owner                    - GitHub User who opened the PR
 * user_requesting_changes  - GitHub User who requested changes for the PR
 */
export class RequestChangesPR extends Base {
  owner: string;
  user_requesting_changes: string;
}
