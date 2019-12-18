/*
 * Model used for when commenting on PR's
 *
 * description        - Description of the PR
 * title              - Title of the PR
 * url                - Link to the PR on the GitHub repo
 * owner              - User who opened the PR
 * user_commenting    - User who is leaving comments on the PR
 */
export type CommentPR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  user_commenting: string;
}
