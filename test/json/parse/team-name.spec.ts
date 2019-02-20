import { expect } from "chai";
import { getTeamName } from "../../../src/json/parse/team-name";

describe("getTeamName", () => {

  const validJSON = {
    Departments: {
      Developers: {
        PhillyDevTeam: {
          Users: {
            Leads: {
              andrew: {
                Slack_Name: "andrew.curcie",
                Slack_Id: "<1111>",
              },
            },
            Members: {
              ethan: {
                Slack_Name: "ethan.painter",
                Slack_Id: "<2222>",
              },
              dillon: {
                Slack_Name: "dillon.sykes",
                Slack_Id: "<3333>",
              },
              daniel: {
                Slack_Name: "daniel.larner",
                Slack_Id: "<4444>",
              },
            },
          },
        },
        FloridaTeam: {
          Users: {
            Leads: {
              mustang: {
                Slack_Name: "Clark",
                Slack_Id: "<5555>",
              },
            },
            Members: {
              cam: {
                Slack_Name: "Newton",
                Slack_Id: "<6666>",
              },
              davy: {
                Slack_Name: "Jones",
                Slack_Id: "<7777>",
              },
            },
          },
        },
      },
    },
  };

  it("should get first team name -- given member github user", () => {
    const githubUser = "ethan";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).to.be.equal(expected);
  });

  it("should get first team name -- given a lead github user", () => {
    const githubUser = "andrew";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).to.be.equal(expected);
  });

  it("should get second team name -- given a member github user", () => {
    const githubUser = "cam";

    const result = getTeamName(githubUser, validJSON);
    const expected = "FloridaTeam";

    expect(result).to.be.equal(expected);
  });

  it("should get second team name -- given a lead github user", () => {
    const githubUser = "mustang";

    const result = getTeamName(githubUser, validJSON);
    const expected = "FloridaTeam";

    expect(result).to.be.equal(expected);
  });

  it("should not get team name -- github user not found", () => {
    const githubUser = "unknownDeveloper";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getTeamName(githubUser, validJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Department found in JSON file", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Team in JSON file", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {
        Developers: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Users defined", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {
        Developers: {
          RichmondVirginiaDevs: {},
        },
      },
    };

    const expected = new Error(`No Users defined for team: RichmondVirginiaDevs`);

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Leads defined", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {
        Developers: {
          RichmondVirginiaDevs: {
            Users: {},
          },
        },
      },
    };

    const expected = new Error("Leads not defined for team: RichmondVirginiaDevs");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Members defined", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {
        Developers: {
          RichmondVirginiaDevs: {
            Users: {
              Leads: {},
            },
          },
        },
      },
    };

    const expected = new Error("Members not defined for team: RichmondVirginiaDevs");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });
});
