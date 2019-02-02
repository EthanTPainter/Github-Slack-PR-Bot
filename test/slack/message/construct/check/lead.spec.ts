import "mocha";
import { expect } from "chai";
import { constructLeadCheck } from "../../../../../src/slack/message/construct/checks/lead";
import { getLeadsReqChanges } from "src/github/parse";

describe("constructLeadCheck", () => {

  const validJSON = {
    Options: {
      Check_Mark_Style: "green",
      Num_Required_Lead_Approvals: 0,
    },
  };

  it("construct a lead check with 0 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 0;
    const leadsApproving = ["Andrew"];
    const leadsReqChanges: string[]  = [];
    const leadsNotApproving = ["Matt"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadsReqChanges, leadsNotApproving);
    const expected = "0 Required Lead Approvals: Andrew :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 0 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 0;
    const leadsApproving: string[] = [];
    const leadsReqChanges: string[] = [];
    const leadsNotApproving = ["Matt"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                           leadsReqChanges, leadsNotApproving);
    const expected = "0 Required Lead Approvals: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 1 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving: string[] = [];
    const leadsReqChanges: string[] = [];
    const leadsNotApproving = ["Matt"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadsReqChanges, leadsNotApproving);
    const expected = "1 Required Lead Approval: @Matt ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 1 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 1;
    const leadsApproving = ["Andrew"];
    const leadReqChanges: string[] = [];
    const leadsNotApproving = ["Matt"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                            leadReqChanges, leadsNotApproving);
    const expected = "1 Required Lead Approval: Andrew :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: string[] = [];
    const leadsReqChanges: string[] = [];
    const leadsNotApproving = ["Matt", "Andrew"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = "2 Required Lead Approvals: @Matt @Andrew ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving: string[] = ["Andrew"];
    const leadsReqChanges: string[] = [];
    const leadsNotApproving = ["Matt"];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = "2 Required Lead Approvals: Andrew :heavy_check_mark: @Matt ";

    expect(result).to.be.equal(expected);
  });

  it("construct a lead check with 2 required reviews and 2 approving", () => {
    validJSON.Options.Num_Required_Lead_Approvals = 2;
    const leadsApproving = ["Andrew", "Matt"];
    const leadsReqChanges: string[] = [];
    const leadsNotApproving: string[] = [];

    const result = constructLeadCheck(validJSON, leadsApproving,
                          leadsReqChanges, leadsNotApproving);
    const expected = "2 Required Lead Approvals: Andrew :heavy_check_mark: Matt :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });
});
