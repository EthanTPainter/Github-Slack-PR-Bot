import { SlackUser } from "../../json";

/**
 * Model used for when synchronizing PRs (when push events occur on a PR)
 * 
 * description      - Description of the PR
 * url              - URL of the PR
 * owner            - User who opened the PR
 */
export type SynchronizePR = {
  description: string;
  title: string;
  url: string;
  alert: boolean;
  reset_approving_users: SlackUser[];
};
