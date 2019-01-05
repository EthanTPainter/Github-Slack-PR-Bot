
/**
 * @author Ethan T Painter
 * @description Construct the description when a user comments
 * @param slackUser The slack user who opened the PR
 * @param commentingUser The slack user who commented on the PR
 */
export function constructCommentDesc(slackUser: string,
                                     commentingUser: string,
                                    ): string {
  const desc: string = `@${commentingUser} has commented on this PR (Owner: ${slackUser})`;
  return desc;
}
