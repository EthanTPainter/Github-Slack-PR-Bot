import { expect } from "chai";
import { Item } from "../../../src/models";
import { formatMyQueue } from "../../../src/dynamo/formatting/format-my-queue";

describe("formatMyQueue", () => {

  it("should format a queue with one PR", () => {
    const queue: Item[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      MemberComplete: false,
      MembersApproving: [],
      leadComplete: false,
      leadsApproving: [],
      records: {
        times: [],
      },
    }];

    const result = formatMyQueue(queue);

    expect(result.includes(queue[0].title)).to.be.equal(true);
    expect(result.includes(queue[0].url)).to.be.equal(true);
  });

  it("should format a queue with two PRs", () => {
    const queue: Item[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      MemberComplete: false,
      MembersApproving: [],
      leadComplete: false,
      leadsApproving: [],
      records: {
        times: [],
      },
    }, {
      owner: {
        Slack_Name: "daniel.larner",
        Slack_Id: "<@23456>",
      },
      title: "feat(12346): New feature 2",
      url: "www.github.com/daniellarner",
      MemberComplete: false,
      MembersApproving: [],
      leadComplete: false,
      leadsApproving: [],
      records: {
        times: [],
      },
    }];

    const result = formatMyQueue(queue);

    expect(result.includes(queue[0].title)).to.be.equal(true);
    expect(result.includes(queue[0].url)).to.be.equal(true);
    expect(result.includes(queue[1].title)).to.be.equal(true);
    expect(result.includes(queue[1].url)).to.be.equal(true);
  });

  it("should format an empty queue", () => {
    const queue: Item[] = [];

    const result = formatMyQueue(queue);

    expect(result.includes("Nothing found in your queue")).to.be.equal(true);
  });

});
