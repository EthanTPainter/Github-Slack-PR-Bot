
/*
 * Model for closing PR's
 *
 * description    - Description of the Pull Request
 * title          - Title of the PR
 * url            - Link to the PR on the GitHub repo
 * owner          - User who opened the PR
 * user_closing   - User who closed the PR
 */
export type ClosePR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  user_closing: string;
}
