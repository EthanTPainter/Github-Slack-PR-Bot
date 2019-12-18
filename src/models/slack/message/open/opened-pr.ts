
/*
 * Model for alerting when a PR has been opened
 *
 * description        - Description of the PR
 * title              - Title of the PR
 * url                - Link to the PR on the GitHub repo
 * owner              - User who has opened the PR
 * group              - (Optional) Group in slack
 *                      Used for alerting all members of a group
 */
export type OpenedPR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  group?: string;
}
