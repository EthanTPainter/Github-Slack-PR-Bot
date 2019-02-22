import { expect } from "chai";
import { getCheckMark, getCheckMarkAlt } from "../../../src/slack/icons/check-mark";

describe("getCheckMark", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DevTeam1: {
            Options: {
              Check_Mark_Text: ":heavy_check_mark:",
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
              Check_Mark_Text: ":white_check_mark:",
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

  it("should get check mark text from DevTeam1 options given lead github user", () => {
    const githubUser = "Matt";

    const result = getCheckMark(githubUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from DevTeam1 options given member github user", () => {
    const githubUser = "Ethan";

    const result = getCheckMark(githubUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from qaTeam2 options given lead github user", () => {
    const githubUser = "Andrew";

    const result = getCheckMark(githubUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from qaTeam2 options given member github user", () => {
    const githubUser = "Daniel";

    const result = getCheckMark(githubUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should throw an error -- Check_Mark_Text not defined", () => {
    json.Departments.Devs.DevTeam1.Options.Check_Mark_Text = undefined;
    const githubUser = "Ethan";

    const expected = new Error("Options.Check_Mark_Text is undefined");

    expect(() => getCheckMark(githubUser, json))
      .to.throw(expected.message);
  });

});

describe("getCheckMarkAlt", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        Devs: {
          DevTeam1: {
            Options: {
              Check_Mark_Text: ":heavy_check_mark:",
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
              Check_Mark_Text: ":white_check_mark:",
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

  it("should get check mark text from DevTeam1 options given lead slack user", () => {
    const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.Matt;

    const result = getCheckMarkAlt(slackUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from DevTeam1 options given member slack user", () => {
    const slackUser = json.Departments.Devs.DevTeam1.Users.Members.Ethan;

    const result = getCheckMarkAlt(slackUser, json);
    const expected = json.Departments.Devs.DevTeam1.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from qaTeam2 options given lead slack user", () => {
    const slackUser = json.Departments.QA.qaTeam2.Users.Leads.Andrew;

    const result = getCheckMarkAlt(slackUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should get check mark text from qaTeam2 options given member slack user", () => {
    const slackUser = json.Departments.QA.qaTeam2.Users.Members.Daniel;

    const result = getCheckMarkAlt(slackUser, json);
    const expected = json.Departments.QA.qaTeam2.Options.Check_Mark_Text;

    expect(result).equal(expected);
  });

  it("should throw an error -- Check Mark Text undefined", () => {
    json.Departments.Devs.DevTeam1.Options.Check_Mark_Text = undefined;
    const slackUser = json.Departments.Devs.DevTeam1.Users.Leads.Matt;

    const expected = new Error("Options.Check_Mark_Text is undefined");

    expect(() => getCheckMarkAlt(slackUser, json))
      .to.throw(expected.message);
  });
});
