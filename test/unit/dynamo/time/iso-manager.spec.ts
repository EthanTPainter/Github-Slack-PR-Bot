import { expect } from "chai";
import { Settings, DateTime } from "luxon";
import {
  createISO,
  fromISO,
  sendCommentSlackAlert,
} from "../../../../src/dynamo/time";

describe("ISO Manager", () => {
  describe("createISO", () => {
    it("should create an ISO string of current date & time", () => {
      // Set current date & time
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();

      const expected = "2019-04-01T00:00:00.000-04:00";
      const result = createISO();

      expect(result).equal(expected);
    });
  });
  describe("fromISO", () => {
    it("should transform an ISO string to DateTime object", () => {
      Settings.now = (): number => new Date(2019, 4, 1).valueOf();
      const isoString = DateTime.local().toISO();

      // tslint:disable-next-line: one-variable-per-declaration
      const expected = {
        year: 2019,
        month: 5,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      };
      const result = fromISO(isoString);

      expect(result.year).equal(expected.year);
      expect(result.month).equal(expected.month);
      expect(result.day).equal(expected.day);
      expect(result.hour).equal(expected.hour);
      expect(result.minute).equal(expected.minute);
      expect(result.second).equal(expected.second);
      expect(result.millisecond).equal(expected.millisecond);
    });
  });
  describe("sendCommentSlackAlert", () => {
    it("should send comment alert -- no previous comments", () => {
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();
      const currentTime = "2019-04-01T00:00:00.000-04:00";
      const teamOptions: any = {
        Avoid_Comment_Alerts: 5,
      };
      const slackUserCommenting = {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      };
      const pr: any = {
        comment_times: {},
      };

      const result = sendCommentSlackAlert(
        currentTime,
        teamOptions,
        slackUserCommenting,
        pr);
      const expectedPR: any = {
        comment_times: { "<SlackMemberId1>": currentTime },
      };
      const expected = { alertSlack: true, pr: expectedPR };

      expect(result.alertSlack).equal(expected.alertSlack);
      expect(result.pr).deep.equal(expected.pr);
    });

    it("should send comment alert -- one comment from another user", () => {
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();
      const currentTime = "2019-04-01T00:00:01.000-04:00";
      const teamOptions: any = {
        Avoid_Comment_Alerts: 5,
      };
      const slackUserCommenting = {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      };
      const pr: any = {
        comment_times: {
          "<SlackMemberId2>": "2019-04-01T00:00:00.000-04:00",
        },
      };

      const result = sendCommentSlackAlert(
        currentTime,
        teamOptions,
        slackUserCommenting,
        pr);
      const expectedPR: any = {
        comment_times: {
          "<SlackMemberId1>": currentTime,
          "<SlackMemberId2>": "2019-04-01T00:00:00.000-04:00",
        },
      };
      const expected = { alertSlack: true, pr: expectedPR };

      expect(result.alertSlack).equal(expected.alertSlack);
      expect(result.pr).deep.equal(expected.pr);
    });

    it("should send comment alert -- Avoid_Comment_Alerts set to 0", () => {
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();
      const currentTime = "2019-04-01T00:00:01.000-04:00";
      const teamOptions: any = {
        Avoid_Comment_Alerts: 0,
      };
      const slackUserCommenting = {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      };
      const pr: any = {
        comment_times: {
          "<SlackMemberId1>": "2019-04-01T00:00:00.000-04:00",
        },
      };

      const result = sendCommentSlackAlert(
        currentTime,
        teamOptions,
        slackUserCommenting,
        pr);
      const expectedPR: any = {
        comment_times: {
          "<SlackMemberId1>": currentTime,
        },
      };
      const expected = { alertSlack: true, pr: expectedPR };

      expect(result.alertSlack).equal(expected.alertSlack);
      expect(result.pr).deep.equal(expected.pr);
    });

    it("should send comment alert -- Last comment exceeds Avoid_Comment_Alerts limit", () => {
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();
      const currentTime = "2019-04-01T00:00:00.000-04:00";
      const teamOptions: any = {
        Avoid_Comment_Alerts: 5,
      };
      const slackUserCommenting = {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      };
      const pr: any = {
        comment_times: {
          "<SlackMemberId1>": "2019-03-31T23:54:59.999-04:00",
        },
      };

      const result = sendCommentSlackAlert(
        currentTime,
        teamOptions,
        slackUserCommenting,
        pr);
      const expectedPR: any = {
        comment_times: {
          "<SlackMemberId1>": currentTime,
        },
      };
      const expected = { alertSlack: true, pr: expectedPR };

      expect(result.alertSlack).equal(expected.alertSlack);
      expect(result.pr).deep.equal(expected.pr);
    });

    it("should not send comment alert -- Last comment within Avoid_Comment_Alerts limit", () => {
      Settings.now = (): number => new Date(2019, 3, 1).valueOf();
      const currentTime = "2019-04-01T00:00:00.000-04:00";
      const teamOptions: any = {
        Avoid_Comment_Alerts: 5,
      };
      const slackUserCommenting = {
        Slack_Id: "<SlackMemberId1>",
        Slack_Name: "SlackMemberName1",
      };
      const pr: any = {
        comment_times: {
          "<SlackMemberId1>": "2019-03-31T23:57:00.000-04:00",
        },
      };

      const result = sendCommentSlackAlert(
        currentTime,
        teamOptions,
        slackUserCommenting,
        pr);
      const expectedPR: any = {
        comment_times: {
          "<SlackMemberId1>": "2019-03-31T23:57:00.000-04:00",
        },
      };
      const expected = { alertSlack: false, pr: expectedPR };

      expect(result.alertSlack).equal(expected.alertSlack);
      expect(result.pr).deep.equal(expected.pr);
    });
  });
});
