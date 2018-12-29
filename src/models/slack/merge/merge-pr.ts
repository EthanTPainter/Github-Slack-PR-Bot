import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model for when PRs are merged in
 *
 * owner            - User who opened the PR
 * user_merging     - User who is merging the PR to the stable branch
 * remote_branch    - Remote branch (Feature/Fix Branch) with the PR
 * stable_branch    - Stable branch the PR is merging into
 */
export class MergePR extends Base {
  owner: string;
  user_merging: string;
  remote_branch: string;
  stable_branch: string;
}
