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
require them.

In other words, we only want to alert one team about their team's activities.
If a dev team makes a PR, that team should be the only team or people notified.

Notifiying the prod or qa teams about dev PR's takes away from engineer 
productivity. To go even deeper with multiple dev teams, you also want 
to specify what each dev team is seeing alerts for. For instance, a 
dev team only wants to see PR's related to their team's sprint and 
tasks. A dev team shouldn't see updates or alerts about another 
team's PR's since

## Adding or Modifying User Groups

We want to be able to define user-groups so we can specify multiple lead 
developers, and multiple dev team members so we can clarify who is 
commenting, approving, and merging PRs specific to the team they are included in.

These user groups should specify team related material including, but not 
limited to: slack user names, github user names, Slack team chat names, etc.

This will take some time to configure and make meaningful in the long run.

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


### Long Term

Listed below are all optional features that are interesting to include:

1) Automatic Team Updates at Scheduled Times

Before each team starts their work day (Time of Standup for each user-group), 
send a list of available PRs involved in the team's sprint. This 
could be as simple as checking all available PRs made by user-group
members in the team and providing status updates around each. This could help
clarify what team members are working on what, which PRs need reviews, etc.

2) Extension of Part 1

At the end of each day (4:30/4:45), send a message to each team slack
chat about the PRs each group-member has opened. These messages should include 
status updates. 

3) Icons > text

Think about adding text in the slack messages for icons to remove text
Example:

Use :heavy_check_mark: for approvals.
Use :X: for requested changes.
Use :thought_balloon: for comments left

```bash
PR Statuses for Team: TEAM_1
SCP-1234: TITLE OF THE TICKET
:heavy_check_mark: Has Peer Approval
:X: Has Lead Approval
:X: Can Merge
```

4) Jira Integration

For our team's goals, we like to apply labels to our JIRA 
sub tasks (`NeedsLeadReview`, `NeedsPeerReview`, 
`LeadReviewWithComments`, `LeadApproved`, etc.). If we could incorporate 
some slack integration to automatically mark specific sub tasks for us 
with updated actions, this might help eliminate some disconnect 
bewtween our GitHub/Slack/JIRA connections.

5) Jira Integration (Part 2)

If we could automaticlly mark selected sub tasks with labels, we should be able
to tell the bot to move them along the swimlanes. However, this gets a bit 
into the configuration of how we manage this, because it's not generic enough to
apply in different scenarios.

6) Waiting for Slack support

Slack currently doesn't support hyperlinks so adding links
directly in slack messages may be long. May have to give a 
link on a separate line for now