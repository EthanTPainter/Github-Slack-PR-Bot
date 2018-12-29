import { Base } from "../..//base";

/*
 * @Author: Ethan T Painter
 * Model for Approving PR alerts.
 *
 * owner            - User who created the PR
 * user_approving   - User who approved the PR
 * peer_approval    - Whether the PR has bee peer approved
 * lead_approval    - Whether the PR has been lead approved
 * pipeline_success - (Optional) Whether the pipeline is successfull
 *                    Optional because pipeline may or may not exist
 * can_merge        - Whether the PR can be merged
 *                    Requires user & lead approval to be true
 *                    If pipeline exists, must be approved as well
 */
export class ApprovePR extends Base {
  owner: string;
  user_approving: string;
  peer_approval: boolean;
  lead_approval: boolean;
  pipeline_success?: boolean;
  can_merge: boolean;
}
