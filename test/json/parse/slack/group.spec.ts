import { expect } from "chai";
import { getSlackGroup } from "../../../../src/json/parse";

describe("getSlackGroup", () => {

  const validJSON = {
    Departments: {
      FirstTeam: {
        FirstSubTeam: {
          Slack_Group: {
            Slack_Name: "MySlackGroup",
            Slack_Id: "<@12345>",
          },
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

    const expected = validJSON.Departments.FirstTeam.FirstSubTeam.Slack_Group;

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No teams available", () => {
    const invalidJSON = {
      Departments: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Department found in JSON file");
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Sub teams available", () => {
    const invalidJSON = {
      Departments: {
        Dev: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users defined for the team", () => {
    const invalidJSON = {
      Departments: {
        Dev: {
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

  it("should throw an error -- No Leads defined for the team", () => {
    const invalidJSON = {
      Departments: {
        Dev: {
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

  it("should throw an error -- No Members defined for the team", () => {
    const invalidJSON = {
      Departments: {
        Dev: {
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

  it("should not throw an error -- no provided slack group", () => {
    const githubUser = "harrison";

    const expected = new Error("No Slack Group found in JSON file");

    expect(() => getSlackGroup(githubUser, validJSON))
      .to.throw(expected.message);
  });

});
