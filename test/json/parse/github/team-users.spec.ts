import { expect } from "chai";
import { getGitHubTeamUsers } from "../../../../src/json/parse";

describe("getGitHubTeamUsers", () => {

  const validJSON = {
    Teams: {
      Dev_Team: {
        Dev_Team_1: {
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
        Dev_Team_2: {
          Users: {
            Leads: {
              mattyIce: "MattDinkel",
            },
            Members: {
              sanket: "SankeyMisal",
              harrison: "HarrisonCrews",
              nick: "NicholasTurnquist",
              shaun: "ShaunBond",
            },
          },
        },
      },
    },
  };

  it("should get Dev_Team_1 users given a Dev_Team_1 GitHub lead", () => {
    const githubUser = "andrew";

    const result = getGitHubTeamUsers(githubUser, validJSON);
    const expected = ["andrew", "ethan", "dillon", "daniel", "joshua"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get Dev_Team_1 users given a Dev_Team_1 GitHub member", () => {
    const githubUser = "dillon";

    const result = getGitHubTeamUsers(githubUser, validJSON);
    const expected = ["andrew", "ethan", "dillon", "daniel", "joshua"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get Dev_Team_2 users given a Dev_Team_2 GitHub lead", () => {
    const githubUser = "mattyIce";

    const result = getGitHubTeamUsers(githubUser, validJSON);
    const expected = ["mattyIce", "sanket", "harrison", "nick", "shaun"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get Dev_Team_2 users given a Dev_Team_2 GitHub member", () => {
    const githubUser = "harrison";

    const result = getGitHubTeamUsers(githubUser, validJSON);
    const expected = ["mattyIce", "sanket", "harrison", "nick", "shaun"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No Teams property in JSON", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "harrison";

    const expected = new Error("No Team (DevTeam, ThisCoolTeam, etc.) found in JSON file");

    expect(() => getGitHubTeamUsers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team Group in JSON", () => {
    const invalidJSON = {
      Teams: {
        DevTeam: {},
      },
    };
    const githubUser = "harrison";

    const expected = new Error("No Team Group (Dev_Team_1, SomethingCool1, etc.) found in JSON file");

    expect(() => getGitHubTeamUsers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users in a Team Group in JSON", () => {
    const invalidJSON = {
      Teams: {
        CoolTeam: {
          CoolTeam1: {},
        },
      },
    };
    const githubUser = "harrison";
    const subTeam = "CoolTeam1";

    const expected = new Error(`No Users defined for team: ${subTeam}`);

    expect(() => getGitHubTeamUsers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads in a Team Group in JSON", () => {
    const invalidJSON = {
      Teams: {
        NeAt: {
          Neato: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "harrison";
    const subTeam = "Neato";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);

    expect(() => getGitHubTeamUsers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members in a Team Group in JSON", () => {
    const invalidJSON = {
      Teams: {
        NeAt: {
          Neato: {
            Users: {
              Leads: {
                BIG_GUY: "bigGuy1",
              },
            },
          },
        },
      },
    };
    const githubUser = "harrison";
    const subTeam = "Neato";

    const expected = new Error(`Members not defined for team: ${subTeam}`);

    expect(() => getGitHubTeamUsers(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- GitHub user not found", () => {
    const validJSON_1 = {
      Teams: {
        TeamUno: {
          SubUno: {
            Users: {
              Leads: {
                OneLeadGuy: "OneLead",
              },
              Members: {
                OneMemberGuy: "OneMember",
              },
            },
          },
        },
      },
    };
    const githubUser = "harrison";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getGitHubTeamUsers(githubUser, validJSON_1))
      .to.throw(expected.message);
  });
});
