import { expect } from "chai";
import { getSlackLeads } from "../../../../../src/json/parse";

describe("getSlackLeads", () => {

  const validJSON = {
    Departments: {
      Dep1: {
        Team1: {
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
            Members: {},
            Leads: {
              Leader1: {
                Slack_Name: "SlackLeadUser1",
                Slack_Id: "<@UUID1111>",
              },
              Leader2: {
                Slack_Name: "SlackLeadUser2",
                Slack_Id: "<@UUID1112>",
              },
              Leader3: {
                Slack_Name: "SlackLeadUser3",
                Slack_Id: "<@UUID1113>",
              },
            },
          },
        },
      },
    },
  };

  it("should get slack leads given lead github user", () => {
    const githubUser = "Leader2";

    const result = getSlackLeads(githubUser, validJSON);
    const expected = [
      validJSON.Departments.Dep1.Team1.Users.Leads.Leader1,
      validJSON.Departments.Dep1.Team1.Users.Leads.Leader2,
      validJSON.Departments.Dep1.Team1.Users.Leads.Leader3,
    ];

    expect(result).deep.equal(expected);
  });

  it("should get only slack lead name", () => {
    const validJSON_1 = {
      Departments: {
        Dep1: {
          Team1: {
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
                Ethan: {
                  Slack_Name: "EthanPainter",
                  Slack_Id: "<@UUID1111>",
                },
              },
              Members: {
                Andrew: {
                  Slack_Name: "AndrewCurcie",
                  Slack_Id: "<@UUID1112>",
                },
              },
            },
          },
        },
      },
    };
    const githubUser = "Andrew";

    const result = getSlackLeads(githubUser, validJSON_1);
    const expected = [
      validJSON_1.Departments.Dep1.Team1.Users.Leads.Ethan,
    ];

    expect(result).deep.equal(expected);
  });

  it("should not get any slack leads -- No existing slack leads", ()  => {
    const validJSON_1 = {
      Departments: {
        Dep1: {
          Team1: {
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
              Leads: {},
              Members: {
                Andrew: {
                  Slack_Name: "AndrewCurcie",
                  Slack_Id: "<@UUID1112>",
                },
              },
            },
          },
        },
      },
    };
    const githubUser = "Andrew";

    const result = getSlackLeads(githubUser, validJSON_1);
    const expected: string[] = [];

    expect(result).deep.equal(expected);
  });

  it("should throw an error -- No Team found", () => {
    const invalidJSON = {
      Departments: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team group found", () => {
    const invalidJSON = {
      Departments: {
        Dep1: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users defined in JSON", () => {
    const invalidJSON = {
      Departments: {
        Dep1: {
          Team1: {},
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Team1";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON as any))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads defined in JSON", () => {
    const invalidJSON = {
      Departments: {
        Dep1: {
          Team1: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Team1";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON as any))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Members defined in JSON", () => {
    const invalidJSON = {
      Departments: {
        Team1: {
          Team: {
            Users: {
              Leads: {},
            },
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "Team";

    const expected = new Error(`Members not defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON as any))
      .to.throw(expected.message);
  });

});
