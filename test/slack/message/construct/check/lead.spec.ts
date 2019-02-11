import { expect } from "chai";
import { constructLeadCheck } from "../../../../../src/slack/message/construct/checks/lead";
import { SlackUser } from "../../../../../src/models";

describe("constructLeadCheck", () => {

  const validJSON = {
    Options: {
      Check_Mark_Style: "green",
      X_Mark_Style: "base",
      Num_Required_Lead_Approvals: 0,
    },
  };

  it("construct a lead check with 0 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 0;
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@12345>" }];
    const leadsReqChanges: SlackUser[]  = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@54321>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadsReqChanges, leadsNotApproving);
    const expected = "0 Required Lead Approvals: Andrew :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 0 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 0;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@1234>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                           leadsReqChanges, leadsNotApproving);

    // This seems a bit odd. Maybe if 0 just exclude from message?
    const expected = "0 Required Lead Approvals: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 1 required review and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@11111>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadsReqChanges, leadsNotApproving);
    const expected = `1 Required Lead Approval: ${leadsNotApproving[0].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 1 required review and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@1111>" }];
    const leadReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@2222>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadReqChanges, leadsNotApproving);
    const expected = "1 Required Lead Approval: Andrew :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@1111>" },
                               { Slack_Name: "Andrew", Slack_Id: "<@2222>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `2 Required Lead Approvals: ${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [{ Slack_Name: "Andrew", Slack_Id: "<@1111>" }];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving = [{ Slack_Name: "Matt", Slack_Id: "<@2222>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `2 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark:`
      + ` ${leadsNotApproving[0].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 2 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving = [{ Slack_Name: "Andrew", Slack_Id: "<@1111>" },
                            { Slack_Name: "Matt", Slack_Id: "<@2222>" }];
    const leadsReqChanges: SlackUser[] = [];
    const leadsNotApproving: SlackUser[] = [];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `2 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark: `
      + `${leadsApproving[1].Slack_Name} :heavy_check_mark: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 1 required review, 0 approving, 1 requested changes", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const leadsNotApproving: SlackUser[] = [];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = "1 Required Lead Approval: Ethan :X: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews, 0 approving, 1 requesting changes", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const leadsNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@1111>" },
                               { Slack_Name: "Dillon", Slack_Id: "<@2222>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `2 Required Lead Approvals: ${leadsReqChanges[0].Slack_Name} :X: `
      + `${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews, 0 approving, 2 requesting chnages", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: SlackUser[] = [];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
                             { Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const leadsNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `2 Required Lead Approvals: ${leadsReqChanges[0].Slack_Name} :X: `
      + `${leadsReqChanges[1].Slack_Name} :X: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 3 required reviews, 1 approving, 1 requested changes", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 3;
    const leadsApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@1111>" }];
    const leadsReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@2222>" }];
    const leadsNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
                               { Slack_Name: "Joshua", Slack_Id: "<@4444>" }];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = `3 Required Lead Approvals: ${leadsApproving[0].Slack_Name} :heavy_check_mark: `
      + `${leadsReqChanges[0].Slack_Name} :X: ${leadsNotApproving[0].Slack_Id} ${leadsNotApproving[1].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });
});
