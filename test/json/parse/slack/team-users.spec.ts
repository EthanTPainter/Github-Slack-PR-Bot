import { expect } from "chai";
import { getSlackUsersAlt } from "../../../../src/json/parse";

describe("getSlackUsersAlt", () => {

  let json: any;

  beforeEach(() => {
    json = {
      Departments: {
        DS: {
          D: {
            Users: {
              Leads: {
                Ethan: {
                  Slack_Id: "<@1111>",
                  Slack_Name: "EthanTPainter",
                },
                Dinkel: {
                  Slack_Id: "<@2222>",
                  Slack_Name: "MattyDinks",
                },
              },
              Members: {
                Andrew: {
                  Slack_Id: "<@3333>",
                  Slack_Name: "AndrewCur",
                },
                Dillon: {
                  Slack_Id: "<@4444>",
                  Slack_Name: "DillPickle",
                },
              },
            },
          },
        },
      },
    };
  });

  it("should get all slack users given slack member id", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };

    const result = getSlackUsersAlt(slackUser.Slack_Id, json);
    const expected = [json.Departments.DS.D.Users.Leads.Ethan,
                      json.Departments.DS.D.Users.Leads.Dinkel,
                      json.Departments.DS.D.Users.Members.Andrew,
                      json.Departments.DS.D.Users.Members.Dillon];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get all skacj users given slack lead id", () => {
    const slackUser = { Slack_Name: "Ethan", Slack_Id: "<@1111>" };

    const result = getSlackUsersAlt(slackUser.Slack_Id, json);
    const expected = [json.Departments.DS.D.Users.Leads.Ethan,
                      json.Departments.DS.D.Users.Leads.Dinkel,
                      json.Departments.DS.D.Users.Members.Andrew,
                      json.Departments.DS.D.Users.Members.Dillon];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- no department", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };
    json = {
      Departments: {},
    };

    const expected = new Error("No Department found in JSON file");

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no team", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };
    json = {
      Departments: {
        T: {},
      },
    };

    const expected = new Error("No Team found in JSON file");

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no users", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };
    json = {
      Departments: {
        T: {
          TS: {},
        },
      },
    };

    const expected = new Error("No Users defined for team: T");

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no leads", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };
    json = {
      Departments: {
        T: {
          TS: {
            Users: {},
          },
        },
      },
    };

    const expected = new Error("Leads not defined for team: T");

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- no members", () => {
    const slackUser = { Slack_Name: "DillPickle", Slack_Id: "<@4444>" };
    json = {
      Departments: {
        T: {
          TS: {
            Users: {
              Leads: {},
            },
          },
        },
      },
    };

    const expected = new Error("Members not defined for team: T");

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });

  it("should throw an error -- slack user id not found", () => {
    const slackUser = { Slack_Name: "AmazingMike", Slack_Id: "<@9999>" };

    const expected = new Error(`Slack user Id: ${slackUser.Slack_Id} could not be found in JSON file`);

    expect(() => getSlackUsersAlt(slackUser.Slack_Id, json))
      .to.throw(expected.message);
  });
});
