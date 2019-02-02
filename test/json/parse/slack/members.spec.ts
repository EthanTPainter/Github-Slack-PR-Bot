import { expect } from "chai";
import { getSlackMembers } from "../../../../src/json/parse";

describe("getSlackMembers", () => {

  const validJSON = {
    Teams: {
      Developers: {
        PhillyDevTeam: {
          Users: {
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

  it("should retrieve slack members given a github user", () => {
    const githubUser = "ethan";

    const result = getSlackMembers(githubUser, validJSON);
    const expected = ["ethan.painter", "dillon.sykes", "daniel.larner"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not retrieve any slack members given a github user", () => {
    const githubUser = "andrew";

    const result = getSlackMembers(githubUser, validJSON);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No Team found", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackMembers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team Group", () => {
    const invalidJSON = {
      Teams: {
        NewYork: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackMembers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users", () => {
    const invalidJSON = {
      Teams: {
        NewYork: {
          TeamOne: {},
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamOne";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackMembers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- Ne Members", () => {
    const invalidJSON = {
      Teams: {
        NewYork: {
          TeamOne: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamOne";

    const expected = new Error(`Members not defined for team: ${subTeam}`);
    expect(() => getSlackMembers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });
});
