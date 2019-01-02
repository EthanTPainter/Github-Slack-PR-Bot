import { Review } from "../../../models/github/reviews";

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
  let reviews: any;

  // Start from the end to grab most recent
  if (reviewList.length === 0) {
    // No reviews yet
    return { None: "No Reviews"};
  }

  let counter = reviewList.length - 1;
  while (counter !== -1) {
    const selectedReview: string = reviewList[counter].user.login;

    // If processing last review (first time through loop), must be most relevant
    if (counter === reviewList.length - 1) {
      reviews[selectedReview] = reviewList[counter].state;
    }
    // Processing all other reviews
    // ...
    counter--;
  }
  return reviews;
}
