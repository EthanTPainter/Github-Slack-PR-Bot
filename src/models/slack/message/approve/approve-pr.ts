/*
 * Model for Approving PR alerts.
 *
 * description        - Description of the PR
 * title              - Title of the PR
 * url                - Link to the PR
 * owner              - User who created the PR
 * user_approving     - User who approved the PR
 * approvals          - Member and Lead approvals
 */
export type ApprovePR = {
  description: string;
  title: string;
  url: string;
  owner: string;
  user_approving: string;
  approvals: string;
}
