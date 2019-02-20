import { expect } from "chai";
import { getSlackGroup, getSlackGroupAlt } from "../../../../src/json/parse";

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
              andrew: {
                Slack_Name: "AndrewCurcie",
                Slack_Id: "<@1110>",
              },
            },
            Members: {
              ethan: {
                Slack_Name: "EthanPainter",
                Slack_Id: "<@1111>",
              },
              dillon: {
                Slack_Name: "DillonSykes",
                Slack_Id: "<@1112>",
              },
              daniel: {
                Slack_Name: "DanielLarner",
                Slack_Id: "<@1113>",
              },
              joshua: {
                Slack_Name: "JoshuaHarris",
                Slack_Id: "<@1114>",
              },
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

  it("should throw an error -- No departments available", () => {
    const invalidJSON = {
      Departments: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Department found in JSON file");
    expect(() => getSlackGroup(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No teams available", () => {
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

describe("GetSlackGroupAlt", () => {

  let validJSON: any;

  beforeEach(() => {
    validJSON = {
      Departments: {
        Devs: {
          DevTeam1: {
            Slack_Group: {
              Slack_Name: "SlackGroup",
              Slack_Id: "<@1000>",
            },
            Users: {
              Leads: {
                andrew: {
                  Slack_Name: "andrew.curcie",
                  Slack_Id: "<@1110>",
                },
              },
              Members: {
                ethan: {
                  Slack_Name: "ethan.painter",
                  Slack_Id: "<@1111>",
                },
                daniel: {
                  Slack_Name: "daniel.larner",
                  Slack_Id: "<@1112>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should get slack group given a lead slack user ID", () => {
    const slackUserID = validJSON.Departments.Devs.DevTeam1.Users.Leads.andrew;

    const result = getSlackGroupAlt(slackUserID, validJSON);
    const expected = validJSON.Departments.Devs.DevTeam1.Slack_Group;

    expect(result).to.be.deep.equal(expected);
  });

  it("should get slack group given a member slack user ID", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.daniel;

    const result = getSlackGroupAlt(slackUserId, validJSON);
    const expected = validJSON.Departments.Devs.DevTeam1.Slack_Group;

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- no departments available", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;
    const invalidJSON = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getSlackGroupAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No teams available", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;
    const invalidJSON = {
      Departments: {
        Devs: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getSlackGroupAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No users defined for the team", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;
    const invalidJSON = {
      Departments: {
        Devs: {
          DevTeam1: {},
        },
      },
    };

    const team = "DevTeam1";
    const expected = new Error("No Users defined for team: " + team);

    expect(() => getSlackGroupAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No leads defined for the team", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;
    const invalidJSON = {
      Departments: {
        Devs: {
          DevTeam1: {
            Users: {},
          },
        },
      },
    };

    const team = "DevTeam1";
    const expected = new Error("Leads not defined for team: " + team);

    expect(() => getSlackGroupAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No members defined for the team", () => {
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;
    const invalidJSON = {
      Departments: {
        Devs: {
          DevTeam1: {
            Users: {
              Leads: {
                matt: {
                  Slack_Name: "Name",
                  Slack_Id: "<@123>",
                },
              },
            },
          },
        },
      },
    };

    const team = "DevTeam1";
    const expected = new Error("Members not defined for team: " + team);

    expect(() => getSlackGroupAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Slack Group", () => {
    validJSON.Departments.Devs.DevTeam1.Slack_Group = undefined;
    const slackUserId = validJSON.Departments.Devs.DevTeam1.Users.Members.ethan;

    const expected = new Error("No Slack Group found in JSON file");

    expect(() => getSlackGroupAlt(slackUserId, validJSON))
      .to.throw(expected.message);
  });
});
