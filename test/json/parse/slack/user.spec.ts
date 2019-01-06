import "mocha";
import { expect } from "chai";
import { getSlackUser } from "../../../../src/json/parse";

describe("getSlackUser", () => {

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

  it("should retrieve the slack user name given a github user", () => {
    const githubUser = "ethan";

    const result = getSlackUser(githubUser, validJSON);
    const expected = "ethan.painter";

    expect(result).to.be.equal(expected);
  });

  it("should not retrieve the slack user name given a github user", () => {
    const githubUser = "dinkel";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getSlackUser(githubUser, validJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Teams", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "dinkel";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team Group", () => {
    const invalidJSON = {
      Teams: {
        TeamGroup1: {},
      },
    };
    const githubUser = "dinkel";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users", () => {
    const invalidJSON = {
      Teams: {
        TeamGroup1: {
          SubGroup: {},
        },
      },
    };
    const githubUser = "dinkel";
    const subTeam = "SubGroup";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads", () => {
    const invalidJSON = {
      Teams: {
        TeamGroup1: {
          SubGroup: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "dinkel";
    const subTeam = "SubGroup";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members", () => {
    const invalidJSON = {
      Teams: {
        TeamGroup1: {
          SubGroup: {
            Users: {
              Leads: {
                andrew: "andrewSLACK",
              },
            },
          },
        },
      },
    };
    const githubUser = "dinkel";
    const subTeam = "SubGroup";

    const expected = new Error(`Members not defined for team: ${subTeam}`);
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });
});
