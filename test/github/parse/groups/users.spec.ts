import { expect } from "chai";
import {
  getUsersApproving,
  getUsersReqChanges,
  getUsersNotApproving,
} from "../../../../src/github/parse/groups/users";
import { SlackUser } from "src/models";

describe("getUsersApproving", () => {

  const json = {
    Departments: {
      Dev: {
        DevTeam1: {
          Users: {
            Leads: {
              andrew: "Andrew1",
            },
            Members: {
              EthanTPainter: "ethan2",
              Greek8eos: "GeorgeMaurk",
              DillonSykes: "DillPickle",
            },
          },
        },
      },
    },
  };

  it("should retrieve slack name for only approving user", () => {
    const usersApproving = ["EthanTPainter"];

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2"];

    expect(result).deep.equal(expected);
  });

  it("should retrieve all users who approved the PR", () => {
    const usersApproving = ["EthanTPainter", "Greek8eos", "andrew"];

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2", "GeorgeMaurk", "Andrew1"];

    expect(result).deep.equal(expected);
  });

  it("should return an empty array when no users are approving", () => {
    const usersApproving: string[] = [];

    const result = getUsersApproving(usersApproving, json);
    const expected: string[] = [];

    expect(result).deep.equal(expected);
  });

  it("should retrieve all users who approved even if they're in different sub teams", () => {
    const usersApproving = ["harrison", "EthanTPainter"];
    const json2 = {
      Departments: {
        DevTeam: {
          DevTeam1: {
            Users: {
              Leads: {
                andrew: "Andrew1",
              },
              Members: {
                EthanTPainter: "ethan2",
                Greek8eos: "GeorgeMaurk",
                DillonSykes: "DillPickle",
              },
            },
          },
          DevTeam2: {
            Users: {
              Leads: {
                dinkel: "TheDinkster",
              },
              Members: {
                harrison: "Crews",
                sanket: "CodeProdigy",
              },
            },
          },
        },
      },
    };

    const result = getUsersApproving(usersApproving, json2);
    const expected = ["Crews", "ethan2"];

    expect(result).deep.equal(expected);
  });

  it("should throw an error when an approving user cannot be found", () => {
    const usersApproving = ["BillyBob"];

    const expected = new Error(`GitHub user: ${usersApproving[0]} could not be ` +
      `found in JSON file`);

    expect(() => getUsersApproving(usersApproving, json)).to.throw(expected.message);
  });
});

describe("getUsersReqChanges", () => {

  const json = {
    Departments: {
      DevTeam: {
        DevTeam1: {
          Users: {
            Leads: {
              andrew: "Andrew1",
            },
            Members: {
              EthanTPainter: "ethan2",
              Greek8eos: "GeorgeMaurk",
              DillonSykes: "DillPickle",
            },
          },
        },
      },
    },
  };

  it("should get one user requesting changes", () => {
    const reviews = ["EthanTPainter"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2"];

    expect(result).deep.equal(expected);
  });

  it("should get multiple users requesting changes", () => {
    const reviews = ["EthanTPainter", "Greek8eos"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2", "GeorgeMaurk"];

    expect(result).deep.equal(expected);
  });

  it("should get all users requesting changes", () => {
    const reviews = ["EthanTPainter", "Greek8eos", "DillonSykes", "andrew"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2", "GeorgeMaurk", "DillPickle", "Andrew1"];

    expect(result).deep.equal(expected);
  });

  it("should not get any users requesting changes", () => {
    const reviews: string[] = [];

    const result = getUsersReqChanges(reviews, json);
    const expected: string[] = [];

    expect(result).deep.equal(expected);
  });

});

describe("getUsersNotApproving", () => {
  it("should retrieve all users not approving or requesting changes to the PR", () => {
    const slackOwner = { Slack_Name: "ethan", Slack_Id: "<@1111>"  };
    const slackUsersApproving = [{ Slack_Name: "daniel", Slack_Id: "<@1112>" }];
    const slackUsersRequestingChanges = [{ Slack_Name: "dillon", Slack_Id: "<@1113>" }];
    const allSlackUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1110>" },
                           { Slack_Name: "ethan", Slack_Id: "<@1111>" },
                           { Slack_Name: "daniel", Slack_Id: "<@1112>" },
                           { Slack_Name: "dillon", Slack_Id: "<@1113>" }];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1110>" }];

    expect(result).deep.equal(expected);
  });

  it("should retrieve no users when all possible users approve the PR", () => {
    const slackOwner = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const slackUsersApproving = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                                 { Slack_Name: "andrew", Slack_Id: "<@1112>" },
                                 { Slack_Name: "dillon", Slack_Id: "<@1113>" }];
    const slackUsersRequestingChanges: SlackUser[] = [];
    const allSlackUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                           { Slack_Name: "ethan", Slack_Id: "<@1114>" },
                           { Slack_Name: "daniel", Slack_Id: "<@1111>" },
                           { Slack_Name: "dillon", Slack_Id: "<@1113>" }];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should retrieve all slack users except the owner", () => {
    const slackOwner = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const slackUsersApproving: SlackUser[] = [];
    const slackUsersRequestingChanges: SlackUser[] = [];
    const allSlackUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                           { Slack_Name: "ethan", Slack_Id: "<@1111>" },
                           { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                           { Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                      { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                      { Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    expect(result).deep.equal(expected);
  });

  it("should retrieve no users when all possible users request changes to the PR", () => {
    const slackOwner = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const slackUsersApproving: SlackUser[] = [];
    const slackUsersRequestingChanges = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                                         { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                                         { Slack_Name: "dillon", Slack_Id: "<@1114>" }];
    const allSlackUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                           { Slack_Name: "ethan", Slack_Id: "<@1111>" },
                           { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                           { Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should retrieve remaining users when some approve and request changes to the PR", () => {
    const slackOwner = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const slackUsersApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" }];
    const slackUsersRequestingChanges = [{ Slack_Name: "daniel", Slack_Id: "<@1113>" }];
    const allSlackUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                           { Slack_Name: "ethan", Slack_Id: "<@1111>" },
                           { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                           { Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = [{ Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    expect(result).deep.equal(expected);
  });
});
