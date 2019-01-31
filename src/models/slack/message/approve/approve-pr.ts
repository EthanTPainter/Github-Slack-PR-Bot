import { Base } from "../base";

/*
 * @Author: Ethan T Painter
 * Model for Approving PR alerts.
 *
 * owner            - User who created the PR
 * user_approving   - User who approved the PR
 * approvals        - Peer and Lead approvals
 */
export class ApprovePR extends Base {
  owner: string;
  user_approving: string;
  approvals: string;
}
