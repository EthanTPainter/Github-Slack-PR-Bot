/*
 * @author: Ethan T Painter
 * Provides a base model/properties for slack messages to be sent
 *
 * Description - Description of the Pull Request. Keep Simple
 *         Example: "Ethan has opened this PR. Needs Peer and Lead Reviews"

 * Title - Title of the PR
 *         Example: feat(Jira-###): Add some feature to the app
 *         Example: chore(): Improve logging
 *
 * Pull Request Link - Link to the Pull Request on the GitHub repo
 *         Example: https://github.com/EthanTPainter/Comparative-Programming/pull/1
 *
 */

export class Base {
  description: string;
  title: string;
  pull_request_link: string;
}
