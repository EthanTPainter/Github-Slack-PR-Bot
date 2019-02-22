import { expect } from "chai";
import { filterLeadApprovedPRs } from "../../../src/dynamo/filter";
import { Item } from "../../../src/models";

describe("filterLeadApprovedPRs", () => {

  it("should filter only PR in queue -- lead approved PR", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterLeadApprovedPRs(queue);
    const expected = queue;

    expect(result).deep.equal(expected);
  });

  it("should filter only PR in queue -- not lead approved PR", () => {
    const queue: any = [{
      member_complete: true,
      lead_complete: true,
    }];

    const result = filterLeadApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter one lead approved PR from queue", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }, {
      member_complete: true,
      lead_complete: false,
    }];

    const result = filterLeadApprovedPRs(queue);
    const expected = [ queue[0] ];

    expect(result).deep.equal(expected);
  });

  it("should filter two lead approved PRs from queue", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: true,
    }, {
      member_complete: true,
      lead_complete: true,
    }, {
      member_complete: false,
      lead_complete: true,
    }];

    const result = filterLeadApprovedPRs(queue);
    const expected = [ queue[0], queue[2] ];

    expect(result).deep.equal(expected);
  });

  it("should filter none lead approved PRs from queue", () => {
    const queue: any = [{
      member_complete: false,
      lead_complete: false,
    }, {
      member_complete: true,
      lead_complete: false,
    }, {
      member_complete: true,
      lead_complete: true,
    }];

    const result = filterLeadApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });

  it("should filter none from empty queue", () => {
    const queue: any = [];

    const result = filterLeadApprovedPRs(queue);
    const expected: Item[] = [];

    expect(result).deep.equal(expected);
  });

});
