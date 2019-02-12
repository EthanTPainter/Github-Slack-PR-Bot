import { expect } from "chai";
import { getSlackUser } from "../../../../src/json/parse";

describe("getSlackUser", () => {

  const validJSON = {
    Departments: {
      Developers: {
        PhillyDevTeam: {
          Users: {
            Leads: {
              andrew: {
                Slack_Name: "andrew.curcie",
                Slack_Id: "<@UUID1111>",
              },
            },
            Members: {
              ethan: {
                Slack_Name: "ethan.painter",
                Slack_Id: "<@UUID1112>",
              },
              dillon: {
                Slack_Name: "dillon.sykes",
                Slack_Id: "<@UUID1113>",
              },
              daniel: {
                Slack_Name: "daniel.larner",
                Slack_Id: "<@UUID1114>",
              },
            },
          },
        },
      },
    },
  };

  it("should retrieve the slack username given a member github user", () => {
    const githubUser = "ethan";

    const result = getSlackUser(githubUser, validJSON);
    const expected = validJSON.Departments.Developers.PhillyDevTeam.Users.Members.ethan;

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve the slack username given a lead github user", () => {
    const githubUser = "andrew";

    const result = getSlackUser(githubUser, validJSON);
    const expected = validJSON.Departments.Developers.PhillyDevTeam.Users.Leads.andrew;

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- github user not found", () => {
    const githubUser = "dinkel";

    const expected = new Error(`GitHub user: ${githubUser} could not be found in JSON file`);

    expect(() => getSlackUser(githubUser, validJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Teams", () => {
    const invalidJSON = {
      Departments: {},
    };
    const githubUser = "dinkel";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team Group", () => {
    const invalidJSON = {
      Departments: {
        QA: {},
      },
    };
    const githubUser = "dinkel";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users", () => {
    const invalidJSON = {
      Departments: {
        Prod: {
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
      Departments: {
        Something: {
          Team1: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "dinkel";
    const subTeam = "Team1";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members", () => {
    const invalidJSON = {
      Departments: {
        Dev: {
          team: {
            Users: {
              Leads: {
                andrew: {
                  Slack_Name: "andrewSLACK",
                  Slack_Id: "<@UUID1111>",
                },
              },
            },
          },
        },
      },
    };
    const githubUser = "dinkel";
    const subTeam = "team";

    const expected = new Error(`Members not defined for team: ${subTeam}`);

    expect(() => getSlackUser(githubUser, invalidJSON))
      .to.throw(expected.message);
  });
});
