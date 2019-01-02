import axios from "axios";

/**
 * @author Ethan T Painter
 * @description Retrieve all reviews for a specific PR
 * @param path The path to add to the BASE_URL to specify the chosen PR
 *             Example: "repos/EthanTPainter/Comparative-Programming/pulls/1/reviews"
 *             This url references the url:
 *             https://github.com/EthanTPainter/Comparative-Programming/pull/1/reviews
 * @param private Whether the repository is private or public. Needed for Auth
 */
export function getReviews(path: string, privateVal: boolean): any {
  const BASE_URL: string = "https://api.github.com";
  let reviews: any;

  // If repository is private
  if (privateVal === true) {

    reviews = {};
  } else {
    // Public repository
    // Generate options for HTTP request
    const options = {
      baseURL: BASE_URL,
      method: "get",
      path: path,
    };

    // Make request with axios to retrieve GitHub reviews for a PR
    reviews = getReviewsList(options);
    console.log(`Reviews: ${reviews}`);
    return reviews;
  }
}

async function getReviewsList(options: any): Promise<any> {
  // Make request with axios to retrieve GitHub reviews for a PR
  try {
    const response = await axios({
      method: options.method,
      baseURL: options.baseURL,
      url: options.path,
    });
    console.log("SUCCESS");
    return response;
  }
  catch (error) {
    throw new Error("Unable to retrieve GitHub PR reviews list");
  }
}
