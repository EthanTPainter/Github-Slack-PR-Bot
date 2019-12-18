/*
 * Model for when PRs are merged in
 *
 * description        - Description of the Pull Request.
 * title              - Title of the PR
 * url                - Link to the Pull Request on the GitHub repo
 * owner              - User who opened the PR
 * user_merging       - User who is merging the PR to the stable branch
 * remote_branch      - Remote branch (Feature/Fix Branch) with the PR
 * base_branch        - Base branch the PR is merging into
 */
export type MergePR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  user_merging: string;
  remote_branch: string;
  base_branch: string;
}
