import * as sinon from "sinon";
import { constructSlackMessage } from "../../../../../src/slack/message/construct";
import { Review } from "../../../../../src/github/api";

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("constructSlackMessage", () => {
	const event = {
		review: {
			state: "commented",
		},
		sender: {
			login: "DillonSykes",
		},
		pull_request: {
			url: "https://github.com",
			head: {
				ref: "feature-branch",
			},
			base: {
				ref: "dev",
			},
			merged: false,
			title: "feature(123): Adding new service",
			user: {
				login: "EthanTPainter",
			},
			html_url: "https://github.com/",
		},
	};

	const json = {
		Departments: {
			Dev: {
				Team1: {
					Options: {
            Avoid_Comment_Alerts: 10,
            Check_Mark_Text: "green",
            X_Mark_Text: "base",
            Queue_Include_Created_Time: false,
            Queue_Include_Updated_Time: false,
            Queue_Include_Approval_Names: false,
            Queue_Include_Req_Changes_Names: false,
            Queue_Include_Owner: false,
            Queue_Include_New_Line: false,
            Num_Required_Member_Approvals: 2,
            Num_Required_Lead_Approvals: 2,
            Disable_GitHub_Alerts: false,
            Member_Before_Lead: false,
          },
					Slack_Group: {
						Slack_Name: "Slack_Group_Name",
						Slack_Id: "<@0000>",
					},
					Users: {
						Leads: {
							gwely: {
								Slack_Name: "andrew.curcie",
								Slack_Id: "<@1111>",
							},
						},
						Members: {
							EthanTPainter: {
								Slack_Name: "ethan.painter",
								Slack_Id: "<@2222>",
							},
							DillonSykes: {
								Slack_Name: "dillon.sykes",
								Slack_Id: "<@3333>",
							},
							DanielLarner: {
								Slack_Name: "daniel.larner",
								Slack_Id: "<@4444>",
							},
						},
					},
				},
			},
		},
	};
	const githubToken = "abc123";

	it("should construct an opened PR slack message", async () => {
		const action = "opened";
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;

		expect(result.includes(action)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should construct a reopened PR slack message", async () => {
		const action = "reopened";
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;

		expect(result.includes(action)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should construct a closed PR slack message", async () => {
		const action = "closed";
		event.pull_request.merged = false;
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;

		expect(result.includes(action)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should construct a merged PR slack message", async () => {
		const action = "closed";
		event.pull_request.merged = true;
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const realAction = "merged";
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;
		const expBase = event.pull_request.base.ref;
		const expHead = event.pull_request.head.ref;

		expect(result.includes(expBase)).equal(true);
		expect(result.includes(expHead)).equal(true);
		expect(result.includes(realAction)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should construct an approved PR slack message", async () => {
		const action = "submitted";
		event.review.state = "approved";
		const reviewClass = new Review();

		const expectedReviews = [
			{
				user: { login: "EthanTPainter" },
				state: "COMMENTED",
			},
			{
				user: { login: "gwely" },
				state: "APPROVED",
			},
			{
				user: { login: "DillonSykes" },
				state: "CHANGES_REQUESTED",
			},
			{
				user: { login: "DillonSykes" },
				state: "APPROVED",
			},
		];

		// Stub getReviews
		sinon.stub(reviewClass, "getReviews").resolves(expectedReviews);

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const realAction = "approved";
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;
		const expNumMember =
			json.Departments.Dev.Team1.Options.Num_Required_Member_Approvals;
		const expNumLead =
			json.Departments.Dev.Team1.Options.Num_Required_Lead_Approvals;

		expect(result.includes(realAction)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
		expect(result.includes(expNumMember + " Required Member")).equal(true);
		expect(result.includes(expNumLead + " Required Lead")).equal(true);
	});

	it("should construct a request changes PR slack message", async () => {
		const action = "submitted";
		event.review.state = "changes_requested";
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const realAction = "requested changes";
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;

		expect(result.includes(realAction)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should construct a commented PR slack message", async () => {
		const action = "submitted";
		event.review.state = "commented";
		const reviewClass = new Review();

		const result = await constructSlackMessage(
			action,
			event,
			json,
			reviewClass,
			githubToken,
		);
		const realAction = "commented";
		const expTitle = event.pull_request.title;
		const expUrl = event.pull_request.html_url;

		expect(result.includes(realAction)).equal(true);
		expect(result.includes(expTitle)).equal(true);
		expect(result.includes(expUrl)).equal(true);
	});

	it("should throw error -- unsupported review state", async () => {
		const action = "submitted";
		const reviewClass = new Review();
		const invalidEvent = {
			review: {
				state: "removed",
			},
		};

		const expected = new Error(
			`Review submitted for PR. ` +
				`Unsupported event.review.state: ${invalidEvent.review.state}`,
		);

		await constructSlackMessage(
			action,
			invalidEvent,
			json,
			reviewClass,
			githubToken,
		).should.be.rejectedWith(Error, expected.message);
	});

	it("should throw error -- unsupported event type", async () => {
		const invalidAction = "PullRequest";
		const reviewClass = new Review();
		const expected = new Error(
			`Action: ${invalidAction} not supported in this application`,
		);

		await constructSlackMessage(
			invalidAction,
			event,
			json,
			reviewClass,
			githubToken,
		).should.be.rejectedWith(Error, expected.message);
	});

	it("should throw error -- approve type but reviewClass not provided", async () => {
		const action = "submitted";
		event.review.state = "approved";
		const reviewClass = undefined;
		const expected = new Error("reviewClass parameter must be defined");

		await constructSlackMessage(
			action,
			event,
			json,
			reviewClass as any,
			githubToken,
		).should.be.rejectedWith(Error, expected.message);
	});
});
