# GitHub-Slack-PR-Bot

- [Problem to Solve](#problem-to-solve)
- [Purpose](#purpose)
  - [Why not use the GitHub Slack Integration App](#why-not-use-the-commmon-github-slack-integration-app?)
- [Adding or Modifying User Groups](#adding-or-modifying-user-groups)
- [Functionality](#functionality)
  - [Core](#core)
    - [Open a PR](#open-a-pr)
    - [Close a PR](#close-a-pr)
    - [Comment on a PR](#comment-on-a-pr)
    - [Request Changes on a PR](#request-changes-on-a-pr)
    - [Approve a PR](#approve-a-pr)
  - [Long Term](#long-term)

## Problem to solve

Consider the situation: a tech company, with more than one small development
team is working on features for a major feature/update. Each team is 
operating with different sprint goals, stories or tasks to complete, and 
needs to communicate within their respective teams in a timely manner.

For small teams, using Jira, Slack, and GitHub for managing epics, stories, 
and sub tasks can make tracking current sprint progress challenging. 

Keeping everyone in the loop about what stories or sub tasks need review, 
when comments or requested changes, or when a pull request has been 
approved are all significant actions that require attention.

## Purpose

This appliction was designed for two small development teams, operating
in different private slack channels. These two small development teams
are working on tasks specific to their sprint, but both teams are 
working on the same three of four repositories.

Having a simple, yet effective method of alerting team members about the
status of PR's made in these repositories, PR's specific to each team,
is of utmost importance. We only want to alert team members of PR's 
specific to the tasks belonging to that team.

### Why not use the commmon GitHub Slack integration App?

The current [GitHub Slack integration app](https://github.com/integrations/slack) provides many avenues of 
customizing what you see from GitHub to Slack. However, customization 
for alerting specific team members or specific slack channels is lacking.

Monitoring branch specific activity on a selected repository was 
a provided feature on the legacy integration app. However, it 
is not currently present on the new application.

Customizing the integration app to only provide updates around PR's 
for one selected repository can still disrupt team communication.

Other dev, qa, or prod teams should be able to create or update PR's to
the same repository without sending these updates to the teams that don't 
require them. In other words, we only want to alert a team about their team's 
activities. If a dev team makes a PR, that team should be the only team 
notified. This confines information specific to teams and allows them to 
operate without flooding 

## Basic Structure

This application is built on a core concept: teams are small enough to have 
two designated roles: *leads* and *members*.

### Leads

### Members

Also referred to as *peers*.

## Adding or Modifying User Groups

See config file(json/src/json.ts)

## Functionality

### Core

#### Sending Alerts to Slack

The primary goal of this application is to provide messages in each 
development team's private slack channel about the status of any PR's 
opened or updated by the team members or team leads. 

#### Open a PR


#### Close a PR


#### Comment on a PR


#### Request Changes on a PR


#### Approve a PR


#### Merge a PR

### Current Goals

* Adding DynamoDB integration

Besides sending regular updates to slack chat when PR actions are 
changed there should also be queues maintained in DynamoDB tables.

The goal is that DynamoDB can maintain statues for the team and each 
individual on a team. This should allow each member from slack to use 
a slash command with the bot to know what is in their queue.

### Long Term

Listed below are all optional features that are interesting to include:

* Jira Integration

For our team's goals, we like to apply labels to our JIRA 
sub tasks (`NeedsLeadReview`, `NeedsPeerReview`, 
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