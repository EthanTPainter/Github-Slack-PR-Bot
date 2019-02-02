import { getSlackUser } from "../../../json/parse";

/**
 * @author Ethan T Painter
 * @description From latest reviews (key/value pairs of github
 *        users, ), retrieve approvals
 * @param latestReviews Object with keys of Github usernames,
 *        values as state
 * @returns array of github users who approved the PR
 * @example
 * Input:
 * { "EthanTPainter": "APPROVED",
 *   "gwely": "COMMENTED",
 *   "DillonSykes": "CHANGES_REQUESTED"
 * }
 * Output:
 * ["EthanTPainter"]
 */
export function getApprovingReviews(latestReviews: any): string[] {
  const approvals: any = [];
  // Check for no reviews
  if (Object.keys(latestReviews) === ["None"]
    && Object.values(latestReviews) === ["No Reviews"]) {
    return [];
  }

  (Object.keys(latestReviews)).forEach((review) => {
    if (latestReviews[review] === "APPROVED") {
      approvals.push(review);
    }
  });
  return approvals;
}

/**
 * @author Ethan T Painter
 * @description From latest reviews (key/value pairs of github
 *        users, ), retrieve approvals
 * @param latestReviews Object with keys of Github usernames,
 *        values as state
 * @returns array of github users who approved the PR
 * @example
 * Input:
 * { "EthanTPainter": "APPROVED",
 *   "gwely": "COMMENTED",
 *   "DillonSykes": "CHANGES_REQUESTED"
 * }
 * Output:
 * ["DillonSykes"]
 */
export function getReqChangesReviews(latestReviews: any): string[] {
  const approvals: any = [];
  // Check for no reviews
  if (Object.keys(latestReviews) === ["None"]
    && Object.values(latestReviews) === ["No Reviews"]) {
    return [];
  }

  (Object.keys(latestReviews)).forEach((review) => {
    if (latestReviews[review] === "CHANGES_REQUESTED") {
      approvals.push(review);
    }
  });
  return approvals;
}
