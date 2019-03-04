import { expect } from "chai";
import { formatNewPullRequest } from "../../../../src/dynamo/formatting";
import { SlackUser } from "../../../../src/models";

describe("formatNewPullRequest", () => {

  let slackUser: SlackUser;
  let event: any;
  let json: any;

  beforeEach(() => {
    slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    event = {
      pull_request: {
        title: "NEW BRANCH NEW FEATURE",
        html_url: "www.google.com",
      },
    };
    json = {
      Departments: {
        D: {
          Ds: {
            Options: {
              Num_Required_Member_Approvals: 1,
              Num_Required_Lead_Approvals: 1,
            },
            Users: {
              Leads: {
                Ethan: {
                  Slack_Name: "EthanPainter",
                  Slack_Id: "<@3018485>",
                },
                Andrew: {
                  Slack_Name: "AndrewC",
                  Slack_Id: "<@1111>",
                },
              },
              Members: {
                Dillon: {
                  Slack_Name: "DillonS",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should format an PullRequest (lead PR, 2 leads, 1 member, 1 lead req, 1 member req)", () => {
    slackUser = { Slack_Name: "EthanPainter", Slack_Id: "<@3018485>" };

    const result = formatNewPullRequest(slackUser, event, json);
    const expected = {
      owner: slackUser,
      title: event.pull_request.title,
      url: event.pull_request.html_url,
      leads_alert: ["<@1111>"],
      members_alert: ["<@2222>"],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: "RANDOM TIMESTAMP",
      }],
    };

    expect(result.leads_alert).deep.equal(expected.leads_alert);
    expect(result.leads_approving).deep.equal(expected.leads_approving);
    expect(result.members_alert).deep.equal(expected.members_alert);
    expect(result.members_approving).deep.equal(expected.members_approving);
    expect(result.events[0].user).deep.equal(expected.events[0].user);
    expect(result.events[0].action).equal("OPENED");
  });

  it("should format an PullRequest (member PR, 2 leads, 1 member, 1 lead req, 1 member req) ", () => {
    slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };

    const result = formatNewPullRequest(slackUser, event, json);
    const expected = {
      owner: slackUser,
      title: event.pull_request.title,
      url: event.pull_request.html_url,
      leads_alert: ["<@3018485>", "<@1111>"],
      members_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: "RANDOM TIMESTAMP",
      }],
    };

    expect(result.leads_alert).deep.equal(expected.leads_alert);
    expect(result.leads_approving).deep.equal(expected.leads_approving);
    expect(result.members_alert).deep.equal(expected.members_alert);
    expect(result.members_approving).deep.equal(expected.members_approving);
    expect(result.events[0].user).deep.equal(expected.events[0].user);
    expect(result.events[0].action).equal("OPENED");
  });

  it("should format an PullRequest (lead PR, 2 leads, 1 member, 1 lead req, 0 member req) ", () => {
    slackUser = { Slack_Name: "EthanPainter", Slack_Id: "<@3018485>" };
    json.Departments.D.Ds.Options.Num_Required_Member_Approvals = 0;

    const result = formatNewPullRequest(slackUser, event, json);
    const expected = {
      owner: slackUser,
      title: event.pull_request.title,
      url: event.pull_request.html_url,
      leads_alert: ["<@1111>"],
      members_alert: [],
      member_complete: true,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: "RANDOM TIMESTAMP",
      }],
    };

    expect(result.leads_alert).deep.equal(expected.leads_alert);
    expect(result.leads_approving).deep.equal(expected.leads_approving);
    expect(result.members_alert).deep.equal(expected.members_alert);
    expect(result.members_approving).deep.equal(expected.members_approving);
    expect(result.events[0].user).deep.equal(expected.events[0].user);
    expect(result.events[0].action).equal("OPENED");
  });

  it("should format an PullRequest (lead PR, 2 leads, 1 member, 0 lead req, 1 member req) ", () => {
    slackUser = { Slack_Name: "EthanPainter", Slack_Id: "<@3018485>" };
    json.Departments.D.Ds.Options.Num_Required_Lead_Approvals = 0;

    const result = formatNewPullRequest(slackUser, event, json);
    const expected = {
      owner: slackUser,
      title: event.pull_request.title,
      url: event.pull_request.html_url,
      leads_alert: [],
      members_alert: ["<@2222>"],
      member_complete: false,
      members_approving: [],
      lead_complete: true,
      leads_approving: [],
      events: [{
        user: slackUser,
        action: "OPENED",
        time: "RANDOM TIMESTAMP",
      }],
    };

    expect(result.leads_alert).deep.equal(expected.leads_alert);
    expect(result.leads_approving).deep.equal(expected.leads_approving);
    expect(result.members_alert).deep.equal(expected.members_alert);
    expect(result.members_approving).deep.equal(expected.members_approving);
    expect(result.events[0].user).deep.equal(expected.events[0].user);
    expect(result.events[0].action).equal("OPENED");
  });

});
