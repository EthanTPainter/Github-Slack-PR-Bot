import "mocha";
import * as nock from "nock";
import { review_result } from "./review-result";
import { expect } from "chai";
import { getReviews } from "../../../src/github/api";

describe("getReviews", () => {
  it("should construct a list of reviews for a PR from a public repo", async () => {
    const baseURL = "https://api.github.com";
    const path = "/repos/EthanTPainter/Comparative-Programming/pulls/1/reviews";

    nock(baseURL)
      .get(path)
      .reply(200, review_result);

    const expected = review_result;

    const actual = await getReviews(path);
    const parsedActual = JSON.parse(actual);

    expect(parsedActual.length).to.be.deep.equal(expected.length);
    expect(parsedActual[0].user.login).to.be.equal(expected[0].user.login);
    expect(parsedActual[0].state).to.be.equal(expected[0].state);
    expect(parsedActual[1].user.login).to.be.equal(expected[1].user.login);
    expect(parsedActual[1].state).to.be.equal(expected[1].state);
    expect(parsedActual[2].user.login).to.be.equal(expected[2].user.login);
    expect(parsedActual[2].state).to.be.equal(expected[2].state);
    expect(parsedActual[3].user.login).to.be.equal(expected[3].user.login);
    expect(parsedActual[3].state).to.be.equal(expected[3].state);
  });

  it("should throw an error (unauthorized)", async () => {
    const baseURL = "https://api.github.com";
    const path = "/repos/EthanTPainter/Comparative-Programming/pulls/1/reviews";
    const errMsg = "User not authorized to make this request" ;

    nock(baseURL)
      .get(path)
      .reply(401, errMsg);

    expect(async () => await getReviews(path)).to.throw(errMsg);
  });
});
