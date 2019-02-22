import { expect } from "chai";
import { filterMemberApprovedPRs } from "../../../src/dynamo/filter";
import { Item } from "../../../src/models";

describe("filterMemberApprovedPRs", () => {

  it("should filter only PR in queue -- member approved", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: false,
    }];

    const result = filterMemberApprovedPRs(queue);
    const expected = queue;

    expect(result).deep.equal(expected);
  });

  it("should filter only PR in queue -- not member approved", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: false,
    }];

    const result = filterMemberApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter one member approved PR", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: false,
    }, {
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterMemberApprovedPRs(queue);
    const expected = [ queue[0] ];

    expect(result).deep.equal(expected);
  });

  it("should filter two member approved PRs", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: false,
    }, {
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: true,
      lead_complete: false,
    }];

    const result = filterMemberApprovedPRs(queue);
    const expected = [ queue[0], queue[2] ];

    expect(result).deep.equal(expected);
  });

  it("should filter none member approved PRs", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterMemberApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter none from empty queue ", () => {
    const queue: any = [];

    const result = filterMemberApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });
});
