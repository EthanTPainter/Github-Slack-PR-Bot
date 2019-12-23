import { expect } from "chai";
import { getSlackUser, getSlackUserAlt } from "../../../../../src/json/parse";
import { JSONConfig } from "../../../../../src/models";

describe("getSlackUser", () => {

  const validJSON = {
    Departments: {
      Developers: {
        PhillyDevTeam: {
          Options: {
            Avoid_Comment_Alerts: 5,
            Check_Mark_Text: ":heavy_check_mark:",
            X_Mark_Text: ":X:",
            Queue_Include_Created_Time: true,
            Queue_Include_Updated_Time: true,
            Queue_Include_Approval_Names: true,
            Queue_Include_Req_Changes_Names: true,
            Queue_Include_Owner: true,
            Queue_Include_New_Line: false,
            Num_Required_Lead_Approvals: 1,
            Num_Required_Member_Approvals: 1,
            Member_Before_Lead: true,
            Disable_GitHub_Alerts: false,
          },
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

    expect(result).deep.equal(expected);
  });

  it("should retrieve the slack username given a lead github user", () => {
    const githubUser = "andrew";

    const result = getSlackUser(githubUser, validJSON);
    const expected = validJSON.Departments.Developers.PhillyDevTeam.Users.Leads.andrew;

    expect(result).deep.equal(expected);
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

    const expected = new Error("No Department found in JSON file");
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

    const expected = new Error("No Team found in JSON file");
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
    expect(() => getSlackUser(githubUser, invalidJSON as any))
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
    expect(() => getSlackUser(githubUser, invalidJSON as any))
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

    expect(() => getSlackUser(githubUser, invalidJSON as any))
      .to.throw(expected.message);
  });
});

describe("getSlackUserAlt", () => {

  const validJSON: JSONConfig = {
    Departments: {
      Developers: {
        PhillyDevTeam: {
          Options: {
            Avoid_Comment_Alerts: 5,
            Check_Mark_Text: ":heavy_check_mark:",
            X_Mark_Text: ":X:",
            Queue_Include_Created_Time: true,
            Queue_Include_Updated_Time: true,
            Queue_Include_Approval_Names: true,
            Queue_Include_Req_Changes_Names: true,
            Queue_Include_Owner: true,
            Queue_Include_New_Line: false,
            Num_Required_Lead_Approvals: 1,
            Num_Required_Member_Approvals: 1,
            Member_Before_Lead: true,
            Disable_GitHub_Alerts: false,
          },
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

  it("should get slack user given lead slack user id", () => {
    const slackUserId = "<@UUID1111>";

    const result = getSlackUserAlt(slackUserId, validJSON);
    const expected = validJSON.Departments.Developers.PhillyDevTeam.Users.Leads.andrew;

    expect(result).deep.equal(expected);
  });

  it("should get slack user given member slack user id", () => {
    const slackUserId = "<@UUID1113>";

    const result = getSlackUserAlt(slackUserId, validJSON);
    const expected = validJSON.Departments.Developers.PhillyDevTeam.Users.Members.dillon;

    expect(result).deep.equal(expected);
  });

  it("should throw an error -- Slack user id not found", () => {
    const slackUserId = "<@UUID2222>";

    const expected = new Error(`Slack user id: ${slackUserId} not found in JSON file`);

    expect(() => getSlackUserAlt(slackUserId, validJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Departments", () => {
    const invalidJSON = {
      Departments: {},
    };
    const slackUserId = "<@UUID1111>";

    const expected = new Error(`No Department found in JSON file`);

    expect(() => getSlackUserAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Teams", () => {
    const invalidJSON = {
      Departments: {
        Teams: {},
      },
    };
    const slackUserId = "<@UUID1111>";

    const expected = new Error(`No Team found in JSON file`);

    expect(() => getSlackUserAlt(slackUserId, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users found", () => {
    const invalidJSON = {
      Departments: {
        Teams: {
          newTeam: {},
        },
      },
    };
    const slackUserId = "<@UUID1111>";
    const teamName = "newTeam";

    const expected = new Error(`Users not defined for team: ${teamName}`);

    expect(() => getSlackUserAlt(slackUserId, invalidJSON as any))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads found", () => {
    const invalidJSON = {
      Departments: {
        Teams: {
          newTeam: {
            Users: {},
          },
        },
      },
    };
    const slackUserId = "<@UUID1111>";
    const teamName = "newTeam";

    const expected = new Error(`Leads not defined for team: ${teamName}`);

    expect(() => getSlackUserAlt(slackUserId, invalidJSON as any))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members found", () => {
    const invalidJSON = {
      Departments: {
        Teams: {
          newTeam: {
            Users: {
              Leads: {
                andrew: {
                  Slack_Name: "ac",
                  Slack_Id: "<@123>",
                },
              },
            },
          },
        },
      },
    };
    const slackUserId = "<@UUID1111>";
    const teamName = "newTeam";

    const expected = new Error(`Members not defined for team: ${teamName}`);

    expect(() => getSlackUserAlt(slackUserId, invalidJSON as any))
      .to.throw(expected.message);
  });
});
