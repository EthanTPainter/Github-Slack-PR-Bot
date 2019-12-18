
/*
 * Model for when changes are requested in a PR
 *
 * description              - Description of the PR
 * title                    - Title of the PR
 * url                      - Link to the PR on the GitHub repo
 * owner                    - GitHub User who opened the PR
 * user_requesting_changes  - GitHub User who requested changes for the PR
 */
export type RequestChangesPR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  user_requesting_changes: string;
}
