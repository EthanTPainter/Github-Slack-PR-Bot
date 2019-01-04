import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model for Approving PR alerts.
 *
 * owner            - User who created the PR
 * user_approving   - User who approved the PR
 * checks           - String of users who approved the PR
 */
export class ApprovePR extends Base {
  owner: string;
  user_approving: string;
  checks: string;
}
