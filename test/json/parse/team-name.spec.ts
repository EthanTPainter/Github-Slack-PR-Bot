import { expect } from "chai";
import { getTeamName } from "../../../src/json/parse/team-name";

describe("getTeamName", () => {

  const validJSON = {
    Teams: {
      Developers: {
        PhillyDevTeam: {
          Users: {
            Leads: {
              andrew: "andrew.curcie",
            },
            Members: {
              ethan: "ethan.painter",
              dillon: "dillon.sykes",
              daniel: "daniel.larner",
            },
          },
        },
      },
    },
  };

  it("should get team name -- given member github user", () => {
    const githubUser = "ethan";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).to.be.equal(expected);
  });

  it("should get team name -- given a lead github user", () => {
    const githubUser = "andrew";

    const result = getTeamName(githubUser, validJSON);
    const expected = "PhillyDevTeam";

    expect(result).to.be.equal(expected);
  });

  it("should not get team name -- github user not found", () => {
    const githubUser = "unknownDeveloper";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getTeamName(githubUser, validJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Team found in JSON file", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Teams: {},
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Team Group in JSON file", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Teams: {
        Developers: {},
      },
    };

    const expected = new Error("No Team Group found in JSON file");

    expect(() => getTeamName(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should not get team name -- No Users defined", () => {
    const githubUser = "ethan";
    const invalidJSON = {
      Teams: {
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
      Teams: {
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
      Teams: {
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
