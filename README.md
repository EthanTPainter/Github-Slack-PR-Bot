# GitHub-Slack-PR-Bot

- [Purpose](#purpose)
- [Basic Structure](#basic-structure)
  - [Options](#options)
- [Functionality](#functionality)
  - [Core](#core)
    - [Making Your JSON Config](#making-your-json-config)
    - [Sending Alerts to Slack](#sending-alerts-to-slack)
  - [Current Goals](#current-goals)
  - [Long Term](#long-term)

## Purpose

This appliction was designed for small development teams, operating
in different slack channels. These small development teams
are working on tasks specific to their sprint, but both teams are 
working within the same three of four repositories.

Having a simple, yet effective method of alerting team members about the
status of PR's made in these repositories (PR's specific to each team)
is of the utmost importance. We only want to alert team members of PR's 
specific to the tasks belonging to that team.

## Basic Structure

Configuration variables are separated into 2 categories: 
1) Environment Variables
2) A JSON Config Variable

The environment variables listed either contain confidential data, 
infrastructure setup, or data to be preserved outside of comitting to a 
GitHub repository. These include GitHub OAuth tokens, Slack Channel tokens, 
and Dynamo table information.

The JSON config variable contains information that can be committed 
and pushed to a GitHub repository. This information is public or 
generic enough to not expose tokens or infrastructure for your setup.
JSON config files are located located at `/src/json/src/`. 

### Environment Variables

All required environment variables are provided in the file: `.env.deploy.template`.

The table below will go further into detail about each variable and it's purpose.

Environment Variable | Description | Values 
-------------------- | ----------- | ------ 
**LOG_LEVEL**: *string* | Log level is the specified log level for the application's dedicated logger. <br> Log levels are separated into 4 main categories: info, debug, warn, and error. When a log level is selected (i.e. "info"), all log statements with this log level are recorded in Cloudwatch for review or inspection. <br><br> When testing locally, it is recommended to use the `info` log level. When deploying this application, it is recommended to use the`debug` log level. | There are 4 valid values: <br> 1) `info` <br> 2) `debug` <br> 3) `warn` <br> 4) `error`. <br><br> Set to `info`, all logs ending with .info, or information logging, will be recorded and saved in Cloudwatch. <br><br> Set to `debug`, all logs ending with .debug, or debug logging, will be recorded and saved in Cloudwatch. <br><br> etc.
**SLS_DEBUG**: "*" | To hide serverless warnings about sls debug when deploying to AWS | Set as `"*"`
**DISABLE_XRAY**: *boolean* | [AWS XRay](https://aws.amazon.com/xray/) is a tracing service allowing dev and production teams to determine time consuming requests or error prone services in their infrastructure. | If you want to disable tracing or logging through this service, set this to `true`. <br><br> If you'd like receive tracing and logging staistics about requests set this to `false`
**GITHUB_OAUTH2_TOKEN**: *string* | A GitHub OAuth2 token allows the user to make requests using [GitHub API](https://developer.github.com/v3/) to public or private repositories. <br> If making requests to private repositories, make sure to have a GPG key registered to your account to enable API requests. | 
**SLACK_API_URI**: *string* | The base uri for using Slack API. <br> Each function that uses a specific API method appends the proper function the base uri. Example: Using `postMessage` function in this application will make a request to `https://slack.com/api/chat.postMessage`. | Set to `"https://slack.com/api"`
**YOUR_FIRST_TEAM_NAME_SLACK_CHANNEL_NAME**: *string* | The name of your team's slack channel. <br><br> Examples: `DEVS_SLACK_CHANNEL_NAME`, `MY_TEAM_SLACK_CHANNEL_NAME`, `GENERAL_SLACK_CHANNEL_NAME`, etc. <br><br> | Set to `[YOUR TEAM NAME]` + `_SLACK_CHANNEL_NAME`
**YOUR_FIRST_TEAM_NAME_SLACK_TOKEN:**: *string* | To send alerts and messages through a third party application to Slack, you will need to create an [App](https://api.slack.com/apps) in Slack. <br> After creating an App, create a bot for you app. Creating a bot will provide you with a user token and bot token. Copy the bot token and paste it here. <br><br> **Note**: This application only expects one bot to exist per application instance. This is ideal for organizations or departments using slack. | 
**DYNAMO_TABLE**: *string* | Name of your table in your Dynamo account. If Dynamo is enabled, this table will be used to record actively maintained queue's of each user and team. <br> Using a Dynamo table enables the use of slash commands to utilize the table's storage. | Any string value meeting AWS DynamoDB table naming standards. <br><br> Example table name: `pull-requests-table`
**DYNAMO_API_VERSION**: *string* | Dynamo API version to use for Dynamo api calls. This application supports the latest version of Dynamo API version: `2012-08-10` | From AWS, there are currently only two versions of DynamoDB API versions: `2012-08-10` and `2011-12-05`.
**DYNAMO_REGION:** *string* | Specify the AWS Dynamo Region for the Dynamo table to exist | Supply values similar to AWS Region. <br><br> Example inputs are: <br> `us-east-1` for eastern United States <br> `us-west-1` for western United States

### Options

Options are provided to allow customization of the application.

All of the described options are expected to be supplied with values, 
or errors will be thrown. The `example.json` file in the same
directory provides dummy values to use if you're not sure what value to use.

Option  |   Description   |   Values
------- | --------------- | ---------
**Avoid_Slack_Channel_Comment_Alerts_Window**: *number* | When a user comments on a PR, an alert is sent to that user's team slack channel. When a user leaves multiple comments in a short period of time, on one PR, a slack channel could a message about each comment. <br><br> Viewing 5 slack messages each telling the team:<br> `user X has commented on pull request Y` <br> provides as much benefit as one slack message with the same message. <br><br> As a result, a window is provided to limit how often a slack channel can be alerted when a PR is commented on by the same user on the same PR multiple instances in a short period of time | If set to `0`: <br><br> when a user **X** comments on pull request **Y** always send an alert to the team channel anytime a user comments on a PR (**no delays or restrictions**). <br><br> If set to `10`: <br><br> **1**) When a user **X** comments on pull request **Y** send an alert to the team channel from user **X** on pull request **Y** <br>**2**) Any comments from user **X** at this time until `10` minutes after will not be sent to the team's slack channel <br>**3**) After `10` minutes have passed, if user **X** comments on pull request **Y** 
**Check_Mark_Text**: *string* | Slack text for representing a check mark icon in slack | Use `:heavy_check_mark:` for a green check mark Slack icon <br><br> Use `:white_check_mark:` for a white check mark Slack icon <br><br> Or use your own text value to represent a check mark in your slack team channel!
**X_Mark_Text**: *string* | Slack text for representing an X mark icon in slack | Use `:X:` for a bright red x mark  Slack icon <br><br> Use `:heavy_multiplication_x:` for an orange x mark Slack icon <br><br> Or use your own text value to represent an X mark icon in slack!
**Num_Required_Member_Approvals**: *number* | Number of required member approvals for a pull request | Set to `0`: no members of the team required to approve the pull request. <br><br> Set to `2`: only two members of a team are required to approve the pull request from the available members in the team
**Num_Required_Lead_Approvals**: *number* | Number of required lead approvals for a pull request | Set to `0`: no leads of the team are required to approve the pull request <br><br> Set to `2`: only two leads of a team are required to approve the pull request from the available leads in the team

## Functionality

### Core

#### Making Your JSON config

### JSON config format

Below is the full JSON config.

```zsh
export const json = {
  Department: {
    Dev: {
      Dev_Team_1: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":heavy_check_mark:",
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Dynamo_Member_Before_Lead: true,
        },
        Slack_Group: {
          Slack_Name: "Group_Slack_Name",
          Slack_Id: "<@SLACK_ID>",
        },
        Users: {
          Leads: {
            GitHub_User_1: {
              Slack_Name: "Slack_user_1",
              Slack_Id: "<@SLACK_ID_1>",
            },
          },
          Members: {
            GitHub_User_2: {
              Slack_Name: "Slack_user_2",
              Slack_Id: "<@SLACK_ID_2>",
            },
            GitHub_User_3: {
              Slack_Name: "Slack_user_3",
              Slack_Id: "<@SLACK_ID_3>",
            },
            GitHub_User_4: {
              Slack_Name: "Slack_user_4",
              Slack_Id: "<@SLACK_ID_4>",
            },
            GitHub_User_5: {
              Slack_Name: "Slack_user_5",
              Slack_Id: "<@SLACK_ID_5>",
            },
          },
        },
      },
    },
  },
};
```

Will need to go further into detail at a later date how to create 
and modify for external teams.

#### Sending Alerts to Slack

The primary goal of this application is to provide messages in each 
development team's private slack channel about the status of any PR's 
opened or updated by the team members or team leads. These messages
should be customized to alert only members necessary

### Current Goals

* Adding DynamoDB integration

Besides sending regular updates to slack chat when PR actions are 
changed there should also be queues maintained in DynamoDB tables.

The goal is that DynamoDB can maintain statues for the team and each 
individual on a team. This should allow each member from slack to use 
a slash command with the bot to know what is in their queue, the team's
queue, or select users and see their queue's for comparison.

### Long Term

Listed below are all optional features that are interesting to include:

* Jira Integration

For our team's goals, we like to apply labels to our JIRA 
sub tasks (`NeedsLeadReview`, `NeedsMemberReview`, 
`LeadReviewWithComments`, `LeadApproved`, etc.). If we could incorporate 
some slack integration to automatically mark specific sub tasks for us 
with updated actions, this might help eliminate some disconnect 
bewtween our GitHub/Slack/JIRA connections.

* Jira Integration (Part 2)

If we could automaticlly mark selected sub tasks with labels, we should be able
to tell the bot to move them along the swimlanes. However, this gets a bit 
into the configuration of how we manage this, because it's not generic enough to
apply in different scenarios.

* Waiting for Slack support

Slack currently doesn't support hyperlinks so adding links
directly in slack messages may cause messages to appear very long.
May have to give a link on a separate line for now