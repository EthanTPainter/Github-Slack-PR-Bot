import { expect } from "chai";
import {
  getTeamName,
  getTeamNameAlt,
} from "../../../../src/json/parse/team-name";

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

describe("getTeamName", () => {

  it("should get first team name -- given member github user", () => {
    const githubUser = "ethan";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).equal(expected);
  });

  it("should get first team name -- given a lead github user", () => {
    const githubUser = "andrew";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).equal(expected);
  });

  it("should get second team name -- given a member github user", () => {
    const githubUser = "cam";

    const result = getTeamName(githubUser, validJSON);
    const expected = "FloridaTeam";

    expect(result).equal(expected);
  });

  it("should get second team name -- given a lead github user", () => {
    const githubUser = "mustang";

    const result = getTeamName(githubUser, validJSON);
    const expected = "FloridaTeam";

    expect(result).equal(expected);
  });

  it("should throw error -- github user not found", () => {
    const githubUser = "unknownDeveloper";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getTeamName(githubUser, validJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- No Department found in JSON file", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw error -- No Team in JSON file", () => {
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

  it("should throw error -- No Users defined", () => {
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

  it("should throw error -- No Leads defined", () => {
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

  it("should throw error -- No Members defined", () => {
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

describe("getTeamNameAlt", () => {

  it("should get first team name -- given member slack user id", () => {
    const memberUserId = "<3333>";

    const result = getTeamNameAlt(memberUserId, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).equal(expected);
  });

  it("should give first team name -- given lead slack user id", () => {
    const leadUserId = "<1111>";

    const result = getTeamNameAlt(leadUserId, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).equal(expected);
  });

  it("should get second team name -- given a member slack user id", () => {
    const slackUserId = "<6666>";

    const result = getTeamNameAlt(slackUserId, validJSON);
    const expected = "FloridaTeam";

    expect(result).equal(expected);
  });

  it("should get second team name -- given a lead slack user id", () => {
    const slackUserId = "<5555>";

    const result = getTeamNameAlt(slackUserId, validJSON);
    const expected = "FloridaTeam";

    expect(result).equal(expected);
  });

  it("should throw an error -- slack user id not found", () => {
    const slackUserId = "<12345>";

    const expected = new Error(`Slack user id: ${slackUserId} could not be found in JSON file`);

    expect(() => getTeamNameAlt(slackUserId, validJSON))
      .throws(expected.message);
  });

  it("should throw an error -- No Department found in JSON file", () => {
    const slackUserId = "<2222>";
    const invalidJSON = {
      Departments: {},
    };

    const expected = new Error(`No Department found in JSON file`);

    expect(() => getTeamNameAlt(slackUserId, invalidJSON))
      .throws(expected.message);
  });

  it("should throw an error -- No Team in JSON file", () => {
    const slackUserId = "<2222>";
    const invalidJSON = {
      Departments: {
        Developers: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getTeamNameAlt(slackUserId, invalidJSON))
      .throws(expected.message);
  });

  it("should throw an error -- No Users dfefined", () => {
    const slackUserId = "<2222>";
    const invalidJSON = {
      Departments: {
        Developers: {
          RichmondDevs: {},
        },
      },
    };

    const expected = new Error("No Users defined for team: RichmondDevs");

    expect(() => getTeamNameAlt(slackUserId, invalidJSON))
      .throws(expected.message);
  });

  it("should throw an error -- No Leads defined", () => {
    const slackUserId = "<2222>";
    const invalidJSON = {
      Departments: {
        Developers: {
          RichmondDevs: {
            Users: {},
          },
        },
      },
    };

    const expected = new Error("Leads not defined for team: RichmondDevs");

    expect(() => getTeamNameAlt(slackUserId, invalidJSON))
      .throws(expected.message);
  });

  it("should throw an error -- No Members defined", () => {
    const slackUserId = "<2222>";
    const invalidJSON = {
      Departments: {
        Devs: {
          RichmondDevs: {
            Users: {
              Leads: {},
            },
          },
        },
      },
    };

    const expected = new Error("Members not defined for team: RichmondDevs");

    expect(() => getTeamNameAlt(slackUserId, invalidJSON))
      .throws(expected.message);
  });
});
