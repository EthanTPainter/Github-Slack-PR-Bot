import * as rp from "request-promise";
import { newLogger } from "../../logger";
import { GitHubReview } from "../../../src/models";

const logger = newLogger("reviews");

/**
 * @description Review class for making GitHub review requests
 */
export class Review {
  /**
   * @description Retrieve all reviews for a specific PR
   * @param {string} path The path to add to the BASE_URL to specify the chosen PR
   *         Example: "repos/EthanTPainter/Comparative-Programming/pulls/1/reviews"
   *         This path references the url:
   *         https://github.com/EthanTPainter/Comparative-Programming/pull/1/reviews
   */
  async getReviews(githubToken: string, url: string): Promise<GitHubReview[]> {
    /*
    * Make request with request-promise to retrieve GitHub reviews for a PR
    * Always add token to retrieve Reviews because of GitHub API rate limtiing
    * Without token: 60 requests per hour
    * With token: 5000 requests per hour + 50 per org member
    * So may as well always include the token to maximize requests
    * https://developer.github.com/v3/rate_limit/
    */
    try {
      // Make request with request-promise to retrieve GitHub reviews for a PR
      const options = {
        method: "get",
        url,
        headers: {
          Authorization: `token ${githubToken}`,
          "User-Agent": "PR-Bot",
          'Content-Type': 'application/json; charset=utf-8',
          "Connection": "keep-alive"
        },
        json: true,
      };

      const result = await rp(options);
      return result;
    }
    catch (error) {
      logger.error(`Error making GET request to: ${url}`);
      logger.error(error.stack);
      throw new Error(error);
    }
  }
}
