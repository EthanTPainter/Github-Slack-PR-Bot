import { expect } from "chai";
import { getTeamOptions, getTeamOptionsAlt } from "../../../../src/json/parse";

describe("getTeamOptions", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {
              Check_Mark_Text: ":check:",
              X_Mark_Text: ":X:",
              Disable_Dynamo: true,
            },
            Users: {
              Leads: {
                Evan: {
                  Slack_Name: "EvanL",
                  Slack_Id: "<@4444>",
                },
              },
              Members: {
                Ethan: {
                  Slack_Name: "EthanP",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
          Ts2: {
            Options: {
              Check_Mark_Text: ":check:",
              X_Mark_Text: ":X:",
              Disable_Dynamo: false,
            },
            Users: {
              Leads: {
                Dinks: {
                  Slack_Name: "MattyD",
                  Slack_Id: "<@4444>",
                },
              },
              Members: {
                Dillon: {
                  Slack_Name: "DillonS",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should get team options given lead GitHub user", () => {
    const githubUser = "Evan";

    const result = getTeamOptions(githubUser, json);
    const expected = json.Departments.T.Ts.Options;

    expect(result).deep.equal(expected);
  });

  it("should get team options given member GitHub user", () => {
    const githubUser = "Ethan";

    const result = getTeamOptions(githubUser, json);
    const expected = json.Departments.T.Ts.Options;

    expect(result).deep.equal(expected);
  });

  it("should throw an error -- No departments", () => {
    const githubUser = "Evan";
    json = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- No team", () => {
    const githubUser = "Evan";
    json = {
      Departments: {
        T: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- No options", () => {
    const githubUser = "Evan";
    json = {
      Departments: {
        T: {
          Ts: {},
        },
      },
    };

    const expected = new Error("No Options defined for team: T");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- No users", () => {
    const githubUser = "Evan";
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
          },
        },
      },
    };

    const expected = new Error("No Users defined for team: T");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- No leads", () => {
    const githubUser = "Evan";
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
            Users: {},
          },
        },
      },
    };

    const expected = new Error("Leads not defined for team: T");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- No members", () => {
    const githubUser = "Evan";
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
            Users: {
              Leads: {},
            },
          },
        },
      },
    };

    const expected = new Error("Members not defined for team: T");

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- user not found", () => {
    const githubUser = "Darrel";

    const expected = new Error(`GitHub user: ${githubUser} not found in JSON`);

    expect(() => getTeamOptions(githubUser, json))
      .to.throw(expected.message);
  });
});

describe("getTeamOptionsAlt", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {
              Check_Mark_Text: ":check:",
              X_Mark_Text: ":X:",
              Disable_Dynamo: true,
            },
            Users: {
              Leads: {
                Evan: {
                  Slack_Name: "EvanL",
                  Slack_Id: "<@4444>",
                },
              },
              Members: {
                Ethan: {
                  Slack_Name: "EthanP",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
          Ts2: {
            Options: {
              Check_Mark_Text: ":check:",
              X_Mark_Text: ":X:",
              Disable_Dynamo: false,
            },
            Users: {
              Leads: {
                Dinks: {
                  Slack_Name: "MattyD",
                  Slack_Id: "<@4444>",
                },
              },
              Members: {
                Dillon: {
                  Slack_Name: "DillonS",
                  Slack_Id: "<@2222>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should get team options given lead github user", () => {
    const slackUser = { Slack_Name: "MattyD", Slack_Id: "<@4444>" };

    const result = getTeamOptionsAlt(slackUser, json);
    const expected = json.Departments.T.Ts2.Options;

    expect(result).deep.equal(expected);
  });

  it("should get team options given member github user", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };

    const result = getTeamOptionsAlt(slackUser, json);
    const expected = json.Departments.T.Ts2.Options;

    expect(result).deep.equal(expected);
  });

  it("should throw an error -- no Departments", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no Teams", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {
        T: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no Options", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {
        T: {
          Ts: {},
        },
      },
    };

    const expected = new Error("No Options defined for team: T");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no Users", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
          },
        },
      },
    };

    const expected = new Error("No Users defined for team: T");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no Leads", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
            Users: {},
          },
        },
      },
    };

    const expected = new Error("Leads not defined for team: T");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no Members", () => {
    const slackUser = { Slack_Name: "DillonS", Slack_Id: "<@2222>" };
    json = {
      Departments: {
        T: {
          Ts: {
            Options: {},
            Users: {
              Leads: {},
            },
          },
        },
      },
    };

    const expected = new Error("Members not defined for team: T");

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- Slack User Id not found", () => {
    const slackUser = { Slack_Name: "DarrenT", Slack_Id: "<@54321>" };

    const expected = new Error(`Slack user id: ${slackUser.Slack_Id} not found in JSON`);

    expect(() => getTeamOptionsAlt(slackUser, json))
      .to.throw(expected.message);
  });
});
