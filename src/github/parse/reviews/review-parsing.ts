import { GitHubReview } from "../../../models/github/reviews";
import { newLogger } from "../../../logger";

const logger = newLogger("ReviewParsing");

/**
 * @description Processes reviews to determine latest review statuses and users
 * @param reviewList A list of reviews provided through a GET request to api.github.com
 * @returns An object with keys set to GitHub usernames and values as submission status
 * @example Example Return:
 * { "EthanTPainter": "COMMENTED",
 *   "gwely": "APPROVED",
 *   "DillonSykes": "CHANGES_REQUESTED"  }
 */

export function parseLatestReviews(
	reviewList: GitHubReview[],
): { [githubUsername: string]: string } {
	// No reviews yet
	if (reviewList.length === 0) {
		logger.debug("No reviews found");
		return {};
	}

	const reviews = reviewList.reduce((acc: any, githubReview: GitHubReview) => {
		return { ...acc, [githubReview.user.login]: githubReview.state };
	}, {});
	return reviews;
}
