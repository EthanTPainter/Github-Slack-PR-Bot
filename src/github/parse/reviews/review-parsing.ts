import { Review } from "../../../models/github/reviews";
import { newLogger } from "../../../logger";

const logger = newLogger("ReviewParsing");

/**
 * @author Ethan T Painter
 * @description Processes reviews to determine latest review statuses and users
 * @param reviewList A list of reviews provided through a GET request to api.github.com
 * @returns An object with keys set to GitHub usernames and values as submission status
 * @example Example:
 * { "EthanTPainter": "COMMENTED",
 *   "gwely": "APPROVED",
 *   "DillonSykes": "CHANGES_REQUESTED"  }
 */

export function getLatestReviews(reviewList: Review[]): any {
  const reviews = {};

  // Start from the end to grab most recent
  if (reviewList.length === 0) {
    // No reviews yet
    logger.debug("No reviews found");
    return { None: "No Reviews" };
  }

  let counter = reviewList.length - 1;
  while (counter !== -1) {
    const selectedReviewUser: string = reviewList[counter].user.login;
    // If processing last review (first time through loop), must be most relevant
    if (counter === reviewList.length - 1) {
      reviews[selectedReviewUser] = reviewList[counter].state;
    }
    else {
      // If user not in reviews, add user: state
      // If user alread in reviews, move to the next review
      if (!(Object.keys(reviews)).includes(selectedReviewUser)) {
        reviews[selectedReviewUser] = reviewList[counter].state;
      }
    }
    counter--;
  }
  logger.debug("Reviews Found: " + JSON.stringify(reviews));
  return reviews;
}
