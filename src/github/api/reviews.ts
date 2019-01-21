import * as rp from "request-promise";
import { config } from "../../config";

/**
 * @author Ethan T Painter
 * @description Retrieve all reviews for a specific PR
 * @param path The path to add to the BASE_URL to specify the chosen PR
 *             Example: "repos/EthanTPainter/Comparative-Programming/pulls/1/reviews"
 *             This path references the url:
 *             https://github.com/EthanTPainter/Comparative-Programming/pull/1/reviews
 */
export async function getReviews(path: string): Promise<any> {
  const BASE_URL: string = "https://api.github.com";
  // Generate options for HTTP request
  const options = {
    url: BASE_URL + path,
    method: "get",
  };

  /*
   * Make request with request-promise to retrieve GitHub reviews for a PR
   * Always add token to retrieve Reviews because of GitHub API rate limtiing
   * Without token: 60 requests per hour
   * With token: 5000 requests per hour
   * So may as well always include the token to maximize requests
   * https://developer.github.com/v3/rate_limit/
   */

  return getReviewsList(options);
}

/**
 * @author Ethan T Painter
 * @description Retrieve a list of reviews from a GitHub API call
 * @param options Options provided for the request
 * @returns List of Reviews for a PR
 */
async function getReviewsList(options: any): Promise<any> {
  // Make request with request-promise to retrieve GitHub reviews for a PR
  const finalOptions = {
    method: options.method,
    url: options.url,
    headers: {
      Authorization: `Bearer ${config.GITHUB_OAUTH2_TOKEN}`,
      "User-Agent": "GitHub-Slack-PR-Bot",
    },
  };
  try {
    const result = await rp(finalOptions);
    return result;
  }
  catch (error) {
    throw new Error(error);
  }
}
