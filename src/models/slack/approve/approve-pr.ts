import { Base } from "../..//base";

export class ApprovePR extends Base {
  user: string;
  peer_approval: boolean;
  lead_approval: boolean;
  pipeline_success: boolean;
  can_merge: boolean;
}
