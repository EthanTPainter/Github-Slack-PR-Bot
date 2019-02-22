import { expect } from "chai";
import { Item } from "../../../src/models";
import { formatMyQueue } from "../../../src/dynamo/formatting/format-my-queue";

describe("formatMyQueue", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DTeam: {
            Options: {
              Include_Created_Time: true,
              Include_Updated_Time: true,
            },
            Users: {
              Leads: {
                Ethan: {
                  Slack_Name: "ethan.painter",
                  Slack_Id: "<@12345>",
                },
              },
              Members: {
                Daniel: {
                  Slack_Name: "daniel.larner",
                  Slack_Id: "<@23456>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should format a queue with one PR", () => {
    const queue: Item[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "EthanP",
            Slack_Id: "<@1234>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }];

    const result = formatMyQueue(queue, json);

    expect(result.includes(queue[0].title)).to.be.equal(true);
    expect(result.includes(queue[0].url)).to.be.equal(true);
    expect(result.includes("Created: " + queue[0].records.times[0])).to.be.equal(true);
    expect(result.includes("Updated: " + queue[0].records.times[0])).to.be.equal(true);
  });

  it("should format a queue with two PRs", () => {
    const queue: Item[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "EthanP",
            Slack_Id: "<@543>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }, {
      owner: {
        Slack_Name: "daniel.larner",
        Slack_Id: "<@23456>",
      },
      title: "feat(12346): New feature 2",
      url: "www.github.com/daniellarner",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "EthanP",
            Slack_Id: "<@666>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }];

    const result = formatMyQueue(queue, json);

    expect(result.includes(queue[0].title)).to.be.equal(true);
    expect(result.includes(queue[0].url)).to.be.equal(true);
    expect(result.includes("Created: " + queue[0].records.times[0])).to.be.equal(true);
    expect(result.includes("Updated: " + queue[1].records.times[0])).to.be.equal(true);

    expect(result.includes(queue[1].title)).to.be.equal(true);
    expect(result.includes(queue[1].url)).to.be.equal(true);
    expect(result.includes("Created: " + queue[1].records.times[0])).to.be.equal(true);
    expect(result.includes("Updated: " + queue[1].records.times[0])).to.be.equal(true);
  });

  it("should format an empty queue", () => {
    const queue: Item[] = [];

    const result = formatMyQueue(queue, json);

    expect(result.includes("Nothing found in your queue")).to.be.equal(true);
  });

});
