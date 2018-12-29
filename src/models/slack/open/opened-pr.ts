import { Base } from "../../base";

/*
 * @Author: Ethan T Painter
 * Model for alerting when a PR has been opened
 *
 * owner - User who has opened the PR
 * group - (Optional) Group in slack
 *         Used for alerting all members of a group
 */
export class OpenedPR extends Base {
  owner: string;
  group?: string;
}
