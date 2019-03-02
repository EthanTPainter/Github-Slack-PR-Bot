import { expect } from "chai";
import { filterMergablePRs } from "../../../src/dynamo/filter";
import { PullRequest } from "../../../src/models";

describe("filterMergablePRs", () => {

  it("should filter only PR in queue -- mergable", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: true,
    }];

    const result = filterMergablePRs(queue);
    const expected = queue;

    expect(result).deep.equal(expected);
  });

  it("should filter only PR in queue -- not mergable", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: false,
    }];

    const result = filterMergablePRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter one mergable PR", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterMergablePRs(queue);
    const expected = [ queue[0] ];

    expect(result).deep.equal(expected);
  });

  it("should filter two mergable PRs", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: true,
      lead_complete: false,
    }];

    const result = filterMergablePRs(queue);
    const expected = [ queue[0], queue[1] ];

    expect(result).deep.equal(expected);
  });

  it("should filter none mergable PRs", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterMergablePRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter none from empty queue ", () => {
    const queue: any = [];

    const result = filterMergablePRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });
});
