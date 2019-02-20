# GitHub-Slack-PR-Bot

- [Purpose](#purpose)
- [Basic Structure](#basic-structure)
  - [Options](#options)
- [Functionality](#functionality)
  - [Core](#core)
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
2) JSON Config Variable

The environment variables listed either contain confidential data, infrastructure setup, or data to be preserved outside of comitting to a GitHub repository. These include GitHub OAuth tokens, Slack Channel tokens, and Dynamo table information.

The JSON config variable(s) contain information that can be committed 
and pushed to a GitHub repository. This information is public or 
generic enough to not expose tokens or infrastructure for your setup.
JSON config files are located located at `/src/json/src/`. 

### Environment Variables

Environment variables are provided.

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
directly in slack messages may be long. May have to give a 
link on a separate line for now