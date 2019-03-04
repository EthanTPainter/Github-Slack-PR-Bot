import * as rp from "request-promise";
import { requiredEnvs } from "../../required-envs";
import { newLogger } from "../../logger";

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
  async getReviews(path: string): Promise<any> {
    const BASE_URL: string = "https://api.github.com";
    // Generate options for HTTP request
    const options = {
      url: BASE_URL + path,
      method: "get",
    };

    logger.info("Base Options provided: " + JSON.stringify(options));

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
      const finalOptions = {
        method: options.method,
        url: options.url,
        headers: {
          Authorization: `Bearer ${requiredEnvs.GITHUB_OAUTH2_TOKEN}`,
          "User-Agent": "GitHub-Slack-PR-Bot",
        },
      };
      logger.info("Final Options: " + JSON.stringify(finalOptions));

      const result = await rp(finalOptions);
      return result;
    }
    catch (error) {
      throw new Error(error);
    }
  }
}
