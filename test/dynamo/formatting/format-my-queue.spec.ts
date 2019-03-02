import { expect } from "chai";
import { PullRequest } from "../../../src/models";
import { formatMyQueue } from "../../../src/dynamo/formatting/format-my-queue";

describe("formatMyQueue", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DTeam: {
            Options: {
              Queue_Include_Created_Time: true,
              Queue_Include_Updated_Time: true,
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
    const queue: PullRequest[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      members_alert: ["<@23456>"],
      leads_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: "EthanP",
          Slack_Id: "<@1234>",
        },
        action: "APPROVED",
        time: "NOW",
      }],
    }];

    const result = formatMyQueue(queue, json);

    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);
  });

  it("should format a queue with two PRs", () => {
    const queue: PullRequest[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      members_alert: ["<@23456>"],
      leads_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: "EthanP",
          Slack_Id: "<@543>",
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }, {
      owner: {
        Slack_Name: "daniel.larner",
        Slack_Id: "<@23456>",
      },
      title: "feat(12346): New feature 2",
      url: "www.github.com/daniellarner",
      members_alert: ["<@23456>"],
      leads_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: "EthanP",
          Slack_Id: "<@666>",
        },
        action: "APPROVED",
        time: "NOW",
      }],
    }];

    const result = formatMyQueue(queue, json);

    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);

    expect(result.includes(queue[1].title)).equal(true);
    expect(result.includes(queue[1].url)).equal(true);
    expect(result.includes("Created: " + queue[1].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);
  });

  it("should format an empty queue", () => {
    const queue: PullRequest[] = [];

    const result = formatMyQueue(queue, json);

    expect(result.includes("Nothing found in your queue")).equal(true);
  });

});
