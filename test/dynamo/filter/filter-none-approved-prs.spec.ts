import { expect } from "chai";
import { filterNoFullyApprovedPRs } from "../../../src/dynamo/filter";
import { PullRequest } from "../../../src/models";

describe("filterNoFullyApprovedPRs", () => {

  it("should filter only PR in queue -- not fully approved", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: false,
    }];

    const result = filterNoFullyApprovedPRs(queue);
    const expected = queue;

    expect(result).deep.equal(expected);
  });

  it("should filter only PR in queue -- approved", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: false,
    }];

    const result = filterNoFullyApprovedPRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter one not flly approved PR", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: false,
      lead_complete: false,
    }];

    const result = filterNoFullyApprovedPRs(queue);
    const expected = [ queue[1] ];

    expect(result).deep.equal(expected);
  });

  it("should filter two not fully approved PRs", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: false,
    }, {
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: false,
      lead_complete: false,
    }];

    const result = filterNoFullyApprovedPRs(queue);
    const expected = [ queue[0], queue[2] ];

    expect(result).deep.equal(expected);
  });

  it("should filter none notFullyApproved PRs", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterNoFullyApprovedPRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter none from empty queue ", () => {
    const queue: any = [];

    const result = filterNoFullyApprovedPRs(queue);
    const expected: PullRequest[] = [];

    expect(result).deep.equal(expected);
  });
});
