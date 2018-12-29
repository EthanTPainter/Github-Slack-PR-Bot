import { Base } from "../../base";

export class MergePR extends Base {
  user: string;
  owner: string;
  remote_branch: string;
  stable_branch: string;
}
