import "mocha";
import { expect } from "chai";
import { getSlackGroup } from "../../../../src/json/parse";

describe("getSlackGroup", () => {

  const validJSON = {
    Teams: {
      FirstTeam: {
        FirstSubTeam: {
          Slack_Group: "MySlackGroup",
          Users: {
            Leads: {
              andrew: "AndrewCurcie",
            },
            Members: {
              ethan: "EthanPainter",
              dillon: "DillonSykes",
              daniel: "DanielLarner",
              joshua: "JoshuaHarris",
            },
          },
        },
      },
    },
  };

  it("should retrieve slack group given github user", () => {
    const githubUser = "ethan";
    const result = getSlackGroup(githubUser, validJSON);

    const expected = "MySlackGroup";

    expect(result).to.be.equal(expected);
  });

  it("should not retrieve slack group give github user", () => {
    const githubUser = "harrison";
    const result = getSlackGroup(githubUser, validJSON);

    const expected = "";

    expect(result).to.be.equal(expected);
  });

  it("should throw an error with no teams available", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error with no sub teams available", () => {
    const invalidJSON = {
      Teams: {
        DevTeam: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error with no users defined for the team", () => {
    const invalidJSON = {
      Teams: {
        DevTeam: {
          Dev_Team_1: {},
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Dev_Team_1";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error with no leads defined for the team", () => {
    const invalidJSON = {
      Teams: {
        DevTeam: {
          Dev_Team_1: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Dev_Team_1";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error with no members defined for the team", () => {
    const invalidJSON = {
      Teams: {
        DevTeam: {
          Dev_Team_1: {
            Users: {
              Leads: {
                BigGuy: "Leader",
              },
            },
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Dev_Team_1";

    const expected = new Error(`Members not defined for team: ${subTeam}`);
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

});
