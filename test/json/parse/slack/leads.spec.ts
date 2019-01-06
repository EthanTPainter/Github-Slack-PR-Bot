import "mocha";
import { expect } from "chai";
import { getSlackLeads } from "../../../../src/json/parse";

describe("getSlackLeads", () => {

  const validJSON = {
    Teams: {
      Team1: {
        TeamGroup1: {
          Users: {
            Leads: {
              Leader1: "SlackLeadUser1",
              Leader2: "SlackLeadUser2",
              Leader3: "SlackLeadUser3",
            },
          },
        },
      },
    },
  };

  it("should get slack leads given lead github user", () => {
    const githubUser = "Leader2";

    const result = getSlackLeads(githubUser, validJSON);
    const expected = ["SlackLeadUser1", "SlackLeadUser2", "SlackLeadUser3"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get slack lead name -- No existing lead github user", () => {
    const validJSON_1 = {
      Teams: {
        Team1: {
          TeamGroup1: {
            Users: {
              Leads: {
                Ethan: "EthanPainter",
              },
              Members: {
                Andrew: "AndrewCurcie",
              },
            },
          },
        },
      },
    };
    const githubUser = "Andrew";

    const result = getSlackLeads(githubUser, validJSON_1);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No Team found", () => {
    const invalidJSON = {
      Teams: {},
    };
    const githubUser = "ethan";

    const expected = new Error("No Team found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Team group found", () => {
    const invalidJSON = {
      Teams: {
        Team1: {},
      },
    };
    const githubUser = "ethan";

    const expected = new Error("No Team Group found in JSON file");
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Users defined in JSON", () => {
    const invalidJSON = {
      Teams: {
        Team1: {
          TeamGroup: {},
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamGroup";

    const expected = new Error(`No Users defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });

  it("should throw an error -- No Leads defined in JSON", () => {
    const invalidJSON = {
      Teams: {
        Team1: {
          TeamGroup: {
            Users: {},
          },
        },
      },
    };
    const githubUser = "ethan";
    const subTeam = "TeamGroup";

    const expected = new Error(`Leads not defined for team: ${subTeam}`);
    expect(() => getSlackLeads(githubUser, invalidJSON))
      .to.throw(expected.message);
  });
});
