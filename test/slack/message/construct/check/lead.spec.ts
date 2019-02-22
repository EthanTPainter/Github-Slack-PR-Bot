import { expect } from "chai";
import { constructLeadCheck } from "../../../../../src/slack/message/construct/checks/lead";
import { SlackUser } from "../../../../../src/models";

describe("constructLeadCheck", () => {

  let validJSON: any;

  beforeEach(() => {
    validJSON = {
      Departments: {
        Dev: {
          t1: {
            Options: {
              Check_Mark_Text: ":heavy_check_mark:",
              X_Mark_Text: ":X:",
              Num_Required_Lead_Approvals: 0,
            },
            Users: {
              Leads: {
                andrew: {
                  Slack_Name: "Andrew",
                  Slack_Id: "<@12345>",
                },
                Matt: {
                  Slack_Name: "Matt",
                  Slack_Id: "<@54321>",
                },
                Ethan: {
                  Slack_Name: "Ethan",
                  Slack_Id: "<@1111>",
                },
                Daniel: {
                  Slack_Name: "Daniel",
                  Slack_Id: "<@2222>",
                },
                Dillon: {
                  Slack_Name: "Dillon",
                  Slack_Id: "<@3333>",
                },
                Jsohua: {
                  Slack_Name: "Joshua",
                  Slack_Id: "<@4444>",
                },
              },
              Members: {},
            },
          },
        },
      },
    };
  });

  it("construct a lead check with 0 required reviews and 1 approving", () => {
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@12345>" }];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = "0 Required Lead Approvals: Andrew :heavy_check_mark: ";

    expect(result).equal(expected);
  });

  it("construct a lead check with 0 required reviews and 0 approving", () => {
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    // This seems a bit odd. Maybe if 0 just exclude from message?
    const expected = "0 Required Lead Approvals: ";

    expect(result).equal(expected);
  });

  it("construct a lead check with 1 required review and 0 approving", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `1 Required Lead Approval: ${leadsNotApproving[0].Slack_Id} `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 1 required review and 1 approving", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@12345>" }];
    const leadReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadReqChanges, leadsNotApproving, options);

    const expected = "1 Required Lead Approval: Andrew :heavy_check_mark: ";

    expect(result).equal(expected);
  });

  it("construct a lead check with 2 required reviews and 0 approving", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" },
    { Slack_Name: "Andrew", Slack_Id: "<@12345>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `2 Required Lead Approvals: ${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 2 required reviews and 1 approving", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [{ Slack_Name: "Andrew", Slack_Id: "<@12345>" }];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `2 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark:`
      + ` ${leadsNotApproving[0].Slack_Id} `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 2 required reviews and 2 approving", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@12345>" },
    { Slack_Name: "Matt", Slack_Id: "<@54321>" }];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving: SlackUser[] = [];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `2 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark: `
      + `${leadsApproving[1].Slack_Name} :heavy_check_mark: `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 1 required review, 0 approving, 1 requested changes", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const leadsNotApproving: SlackUser[] = [];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = "1 Required Lead Approval: Ethan :X: ";

    expect(result).equal(expected);
  });

  it("construct a lead check with 2 required reviews, 0 approving, 1 requesting changes", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const leadsNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
    { Slack_Name: "Dillon", Slack_Id: "<@3333>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `2 Required Lead Approvals: ${leadsReqChanges[0].Slack_Name} :X: `
      + `${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 2 required reviews, 0 approving, 2 requesting chnages", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
    { Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const leadsNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `2 Required Lead Approvals: ${leadsReqChanges[0].Slack_Name} :X: `
      + `${leadsReqChanges[1].Slack_Name} :X: `;

    expect(result).equal(expected);
  });

  it("construct a lead check with 3 required reviews, 1 approving, 1 requested changes", () => {
    validJSON.Departments.Dev.t1.Options.Num_Required_Lead_Approvals = 3;
    const leadsApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const leadsNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
    { Slack_Name: "Joshua", Slack_Id: "<@4444>" }];
    const options = validJSON.Departments.Dev.t1.Options;

    const result = constructLeadCheck(validJSON, leadsApproving,
      leadsReqChanges, leadsNotApproving, options);

    const expected = `3 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark: `
      + `${leadsReqChanges[0].Slack_Name} :X: ${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).equal(expected);
  });
});
