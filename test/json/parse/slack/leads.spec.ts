import { expect } from "chai";
import { getSlackLeads } from "../../../../src/json/parse";

describe("getSlackLeads", () => {

  const validJSON = {
    Teams: {
      Team1: {
        TeamGroup1: {
          Users: {
            Members: {},
            Leads: {
              Leader1: {
                Slack_Name: "SlackLeadUser1",
                Slack_Id: "<@UUID1111>",
              },
              Leader2: {
                Slack_Name: "SlackLeadUser2",
                Slack_Id: "<@UUID1112>",
              },
              Leader3: {
                Slack_Name: "SlackLeadUser3",
                Slack_Id: "<@UUID1113>",
              },
            },
          },
        },
      },
    },
  };

  it("should get slack leads given lead github user", () => {
    const githubUser = "Leader2";

    const result = getSlackLeads(githubUser, validJSON);
    const expected = [
      validJSON.Teams.Team1.TeamGroup1.Users.Leads.Leader1,
      validJSON.Teams.Team1.TeamGroup1.Users.Leads.Leader2,
      validJSON.Teams.Team1.TeamGroup1.Users.Leads.Leader3,
    ];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get only slack lead name", () => {
    const validJSON_1 = {
      Teams: {
        Team1: {
          TeamGroup1: {
            Users: {
              Leads: {
                Ethan: {
                  Slack_Name: "EthanPainter",
                  Slack_Id: "<@UUID1111>",
                },
              },
              Members: {
                Andrew: {
                  Slack_Name: "AndrewCurcie",
                  Slack_Id: "<@UUID1112>",
                },
              },
            },
          },
        },
      },
    };
    const githubUser = "Andrew";

    const result = getSlackLeads(githubUser, validJSON_1);
    const expected = [
      validJSON_1.Teams.Team1.TeamGroup1.Users.Leads.Ethan,
    ];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any slack leads -- No existing slack leads", ()  => {
    const validJSON_1 = {
      Teams: {
        Team1: {
          TeamGroup1: {
            Users: {
              Leads: {},
              Members: {
                Andrew: {
                  Slack_Name: "AndrewCurcie",
                  Slack_Id: "<@UUID1112>",
                },
              },
            },
          },
        },
      },
    };
    const githubUser = "Andrew";

    const result = getSlackLeads(githubUser, validJSON_1);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No Team found", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team group found", () => {
    const invalidJSON = {
      Teams: {
        Team1: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users defined in JSON", () => {
    const invalidJSON = {
      Teams: {
        Team1: {
          TeamGroup: {},
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamGroup";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads defined in JSON", () => {
    const invalidJSON = {
      Teams: {
        Team1: {
          TeamGroup: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamGroup";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members defined in JSON", () => {
    const invalidJSON = {
      Teams: {
        Team1: {
          TeamGroup: {
            Users: {
              Leads: {},
            },
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamGroup";

    const expected = new Error(`Members not defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

});
