import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model used for when commenting on PR's
 *
 * owner            - User who opened the PR
 * user_commenting  - User who is leaving comments on the PR
 */
export class Comment extends Base {
  owner: string;
  user_commenting: string;
}
