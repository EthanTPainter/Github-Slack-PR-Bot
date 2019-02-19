import { newLogger } from "../../../../logger";

const logger = newLogger("path");

/**
 * @description Retrieve core path and modify for API request
 * @param event Event recevied from the GitHub webhook
 * @returns string of the path for GET requests using GitHub API
 */
export function getPath(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.url === undefined) {
    throw new Error("event.pull_request.url is undefined");
  }
  const fullUrl = event.pull_request.url;
  const reviewsUrl = fullUrl + "/reviews";
  return reviewsUrl;
}
