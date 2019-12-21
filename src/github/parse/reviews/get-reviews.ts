import { newLogger } from "../../../logger";

const logger = newLogger("GetReviews");
/**
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
export function getApprovingReviews(latestReviews: {
	[githubUsername: string]: string;
}): string[] {
	const approvals: string[] = [];
	// Check for no reviews
	if (Object.keys(latestReviews).length === 0) {
		return [];
	}

	Object.keys(latestReviews).forEach((review) => {
		if (latestReviews[review] === "APPROVED") {
			approvals.push(review);
		}
	});
	logger.debug("Approving Reviews: " + approvals);
	return approvals;
}

/**
 * @description From latest reviews (key/value pairs of github
 *        users), retrieve approvals
 * @param latestReviews Object with keys of Github usernames,
 *        values as state
 * @returns array of github users who requested changes to
 *          the PR
 * @example
 * Input:
 * { "EthanTPainter": "APPROVED",
 *   "gwely": "COMMENTED",
 *   "DillonSykes": "CHANGES_REQUESTED"
 * }
 * Output:
 * ["DillonSykes"]
 */
export function getReqChangesReviews(latestReviews: {
	[githubUsername: string]: string;
}): string[] {
	const approvals: string[] = [];
	// Check for no reviews
	if (Object.keys(latestReviews).length === 0) {
		return [];
	}

	Object.keys(latestReviews).forEach((review) => {
		if (latestReviews[review] === "CHANGES_REQUESTED") {
			approvals.push(review);
		}
	});
	logger.debug("Requesting Changes Reviews: " + approvals);
	return approvals;
}
