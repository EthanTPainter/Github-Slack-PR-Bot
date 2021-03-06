import { expect } from "chai";
import { formatTeamQueue } from "../../../../src/dynamo/formatting";
import { PullRequest } from "../../../../src/models";

describe("formatTeamQueue", () => {

  let json: any;
  let queue: any;

  beforeEach(() => {
    json = {
      Departments: {
        Test: {
          TestTeam: {
            Options: {
              Avoid_Comment_Alerts: 5,
              Check_Mark_Text: ":check:",
              X_Mark_Text: ":X:",
              Queue_Include_Created_Time: true,
              Queue_Include_Updated_Time: true,
              Num_Required_Member_Approvals: 1,
              Num_Required_Lead_Approvals: 1,
              Member_Before_Lead: false,
            },
            Users: {
              Leads: {
                Ethan: {
                  Slack_Name: "EthanP",
                  Slack_Id: "<@UUID1>",
                },
                Andrew: {
                  Slack_Name: "AndrewC",
                  Slack_Id: "<@999>",
                },
              },
              Members: {
                Daniel: {
                  Slack_Name: "DanielD",
                  Slack_Id: "<@54321>",
                },
                Dillon: {
                  Slack_Name: "DilPickles",
                  Slack_Id: "<@4321>",
                },
                Harrison: {
                  Slack_Name: "HarrisonC",
                  Slack_Id: "<@555>",
                },
                Sanket: {
                  Slack_Name: "SanketM",
                  Slack_Id: "<@777>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should return nothing in the queue", () => {
    queue = [];

    const result = formatTeamQueue(queue, json);
    const expected = "Nothing found in the team queue";

    expect(result).equal(expected);
  });

  it("should format only one mergable PR", () => {
    // Create queue with 1 PR, 1 Lead Approving, and 1 Member approving
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }, {
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "SECOND",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Mergable PR")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time))
      .equal(true);
    expect(result.includes("Updated: " + queue[0].events[1].time))
      .equal(true);
  });

  it("should format two mergable PRs", () => {
    // Create queue with 2 PRs, 1 Lead Approving, and 1 Member approving
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }, {
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "SECOND",
      }],
    }, {
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE WITH NEW SERVICE",
      url: "www.github.com/aws",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST_1",
      }, {
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "SECOND_1",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Mergable PR")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time))
      .equal(true);
    expect(result.includes("Updated: " + queue[0].events[1].time))
      .equal(true);

    expect(result.includes(queue[1].title)).equal(true);
    expect(result.includes(queue[1].url)).equal(true);
    expect(result.includes("Created: " + queue[1].events[0].time))
      .equal(true);
    expect(result.includes("Updated: " + queue[1].events[1].time))
      .equal(true);
  });

  it("should format one lead approved PR", () => {
    // Create queue with 1 PR, 1 Lead Approving
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: false,
      members_approving: [],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Member Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);
  });

  it("should format two lead approved PRs", () => {
    // Create queue with 2 PRs, 1 Lead Approving each
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: false,
      members_approving: [],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }, {
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE WITH NEW SERVICE",
      url: "www.github.com/aws",
      member_complete: false,
      members_approving: [],
      lead_complete: true,
      leads_approving: [json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Leads.Ethan.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST_1",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Member Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);

    expect(result.includes(queue[1].title)).equal(true);
    expect(result.includes(queue[1].url)).equal(true);
    expect(result.includes("Created: " + queue[1].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);
  });

  it("should format one member approved PR", () => {
    // Create queue with 1 PR, 1 Member Approving
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Lead Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);
  });

  it("should format two member approved PRs", () => {
    // Create queue with 2 PRs, 1 Member Approving each
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }, {
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE NEW SERVICE",
      url: "www.github.com/aws",
      member_complete: true,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Sanket.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Sanket.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Sanket.Slack_Id,
        },
        action: "APPROVED",
        time: "SECOND",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Lead Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);

    expect(result.includes(queue[1].title)).equal(true);
    expect(result.includes(queue[1].url)).equal(true);
    expect(result.includes("Created: " + queue[1].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);
  });

  it("should format one not fully approved PR", () => {
    // Increase Num required member approvals
    json.Departments.Test.TestTeam.Options.Num_Required_Member_Approvals = 2;

    // Create queue with 1 PR, 1 Member Approving
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: false,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Member and Lead Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);
  });

  it("should format two not fully approved PRs", () => {
    // Increase Num required member approvals
    json.Departments.Test.TestTeam.Options.Num_Required_Member_Approvals = 2;

    // Create queue with 2 PRs, 1 Member Approving each
    queue = [{
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE",
      url: "www.github.com/google",
      member_complete: false,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "FIRST",
      }],
    }, {
      owner: {
        Slack_Name: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Name,
        Slack_Id: json.Departments.Test.TestTeam.Users.Members.Dillon.Slack_Id,
      },
      title: "NEW FEATURE NEW SERVICE",
      url: "www.github.com/aws",
      member_complete: false,
      members_approving: [json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Name,
          Slack_Id: json.Departments.Test.TestTeam.Users.Members.Daniel.Slack_Id,
        },
        action: "APPROVED",
        time: "SECOND",
      }],
    }];

    const result = formatTeamQueue(queue, json);

    expect(result.includes("Needs Member and Lead Approvals")).equal(true);
    expect(result.includes(queue[0].title)).equal(true);
    expect(result.includes(queue[0].url)).equal(true);
    expect(result.includes("Created: " + queue[0].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[0].events[0].time)).equal(true);

    expect(result.includes(queue[1].title)).equal(true);
    expect(result.includes(queue[1].url)).equal(true);
    expect(result.includes("Created: " + queue[1].events[0].time)).equal(true);
    expect(result.includes("Updated: " + queue[1].events[0].time)).equal(true);
  });
});
