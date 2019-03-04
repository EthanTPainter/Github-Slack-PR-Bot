import { expect } from "chai";
import { getXMark, getXMarkAlt } from "../../../../src/slack/icons/x-mark";

describe("getXMark", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DevTeam1: {
            Options: {
              X_Mark_Text: ":X:",
            },
            Users: {
              Leads: {
                Matt: {
                  Slack_Name: "Matt",
                  Slack_Id: "<@333>",
                },
              },
              Members: {
                Ethan: {
                  Slack_Name: "Ethan",
                  Slack_Id: "<@123>",
                },
              },
            },
          },
        },
        QA: {
          qaTeam2: {
            Options: {
              X_Mark_Text: ":heavy_multiplication_x:",
            },
            Users: {
              Leads: {
                Andrew: {
                  Slack_Name: "Andrew",
                  Slack_Id: "<@345>",
                },
              },
              Members: {
                Daniel: {
                  Slack_Name: "Daniel",
                  Slack_Id: "<@321>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should retrieve X mark text from DevTeam1 options with lead github user", () => {
    const githubUser = "Matt";

    const result = getXMark(githubUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.X_Mark_Text;

    expect(result).equal(expected);
  });

  it("should retrieve X mark text from DevTeam1 options with member github user", () => {
    const githubUser = "Ethan";

    const result = getXMark(githubUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.X_Mark_Text;

    expect(result).equal(expected);
  });

  it("should retrieve X mark text from qaTeam2 options with lead github user", () => {
    const githubUser = "Andrew";

    const result = getXMark(githubUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.X_Mark_Text;

    expect(result).equal(expected);
  });

  it("should retrieve X mark text from qaTeam2 options with member github user", () => {
    const githubUser = "Daniel";

    const result = getXMark(githubUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.X_Mark_Text;

    expect(result).equal(expected);
  });

  it("should throw an error -- X mark text is undefined", () => {
    json.Departments.Devs.DevTeam1.Options.X_Mark_Text = undefined;
    const githubUser = "Matt";

    const expected = new Error("Options.X_Mark_Text is undefined");

    expect(() => getXMark(githubUser, json))
      .to.throw(expected.message);
  });
});

describe("getXMarkAlt", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DevTeam1: {
            Options: {
              X_Mark_Text: ":X:",
            },
            Users: {
              Leads: {
                Matt: {
                  Slack_Name: "Matt",
                  Slack_Id: "<@333>",
                },
              },
              Members: {
                Ethan: {
                  Slack_Name: "Ethan",
                  Slack_Id: "<@123>",
                },
              },
            },
          },
        },
        QA: {
          qaTeam2: {
            Options: {
              X_Mark_Text: ":heavy_multiplication_x:",
            },
            Users: {
              Leads: {
                Andrew: {
                  Slack_Name: "Andrew",
                  Slack_Id: "<@345>",
                },
              },
              Members: {
                Daniel: {
                  Slack_Name: "Daniel",
                  Slack_Id: "<@321>",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should retrieve X mark text from DevTeam1 options with lead slack user", () => {
    const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.Matt;

    const result = getXMarkAlt(slackUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.X_Mark_Text;

    expect(result).deep.equal(expected);
  });

  it("should retrieve X mark text from DevTeam1 options with member slack user", () => {
    const slackUser = json.Departments.Devs.DevTeam1.Users.Members.Ethan;

    const result = getXMarkAlt(slackUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.X_Mark_Text;

    expect(result).deep.equal(expected);
  });

  it("should retrieve X mark text from qaTeam2 options with lead slack user", () => {
    const slackUser = json.Departments.QA.qaTeam2.Users.Leads.Andrew;

    const result = getXMarkAlt(slackUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.X_Mark_Text;

    expect(result).deep.equal(expected);
  });

  it("should retrieve X mark text from qaTeam2 options with member slack user", () => {
    const slackUser = json.Departments.QA.qaTeam2.Users.Members.Daniel;

    const result = getXMarkAlt(slackUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.X_Mark_Text;

    expect(result).deep.equal(expected);
  });

  it("should throw an error -- x mark text is undefined", () => {
    json.Departments.QA.qaTeam2.Options.X_Mark_Text = undefined;
    const slackUser = json.Departments.QA.qaTeam2.Users.Members.Daniel;

    const expected = new Error("Options.X_Mark_Text is undefined");

    expect(() => getXMarkAlt(slackUser, json))
      .to.throw(expected.message);
  });

});
