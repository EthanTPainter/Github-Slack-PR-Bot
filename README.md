# GitHub-Slack-PR-Bot

## Notification from GitHub

![](./gifs/GitHub-notification-overview.gif)

## Slash Command from Slack

![](./gifs/Slash-command-overview.gif)

- [Purpose](#purpose)
- [Functionality](#functionality)
  - [GitHub Notifications](#github-notifications)
    - [Opened](#opened)
    - [Closed](#closed)
    - [Approved](#approved)
    - [Changes Requested](#changes-requested)
    - [Commented](#commented)
    - [Merged](#merged)
  - [Slack Slash Commands](#slack-slash-commands)
    - [Echo](#echo)
    - [My Queue](#my-queue)
    - [Team Queue](#team-queue)
    - [Get Queue](#get-queue)
    - [Fixed PR](#fixed-pr)
- [Setup](#setup)
  - [Deploying AWS Infrastructure](#deploying-aws-infrastructure)
  - [Creating Slack App And Bot](#creating-slack-app-and-bot)
  - [Deploying Lambdas](#deploying-lambdas)
    - [Creating a JSON Config](#creating-a-json-config)
    - [Setting Environment Variables](#setting-environment-variables)
    - [Running deploy scripts](#Running-deploy-scripts)
  - [Adding GitHub webhooks](#adding-github-webhooks)
  - [Creating Slack slash commands](#creating-slack-slash-commands)
    - [Creating Echo](#creating-echo)
    - [Creating My Queue](#creating-my-queue)
    - [Creating Team Queue](#creating-team-queue)
    - [Creating Get Queue](#creating-get-queue)
    - [Creating Fixed PR](#creating-fixed-pr)
- [Architecture](#architecture)
  - [Overall Architecture](#overall-architecture)
  - [GitHub Notifications Only](#github-notifications-only)
  - [Slack Slash Commands Only](#slack-slash-commands-only)
- [Basic Structure](#basic-structure)
  - [Environment Variables](#environment-variables)
  - [Options](#options)
  - [JSON Config Format](#json-config-format)

## Purpose

This application provides two services:
1) Communicates PR changes from GitHub to team slack channels
2) Allows slack users to communicate with the bot to review PR statuses

These services can also be implemented independently. Steps are described below.

## Functionality

### GitHub Notifications
**Preface**: GitHub repositories must be configured by creating a [webhook](https://developer.github.com/webhooks/creating/)
to the SNS Manager Lambda. Otherwise the GitHub notifications will not be sent to the Lambda for processing. The PR bot must

The PR bot responds to the following PR actions:

1) When a pull request is `opened`
2) When a pull request is `closed`
3) When a pull request is `approved`
4) When a pull request has `changes requested`
5) When a pull request is `commented` on
6) When a pull request is `merged`

#### Opened
When a pull request is opened, there are two possible formats based on [Members_Before_Leads JSON config option](#options)

1) If `Members_Before_Leads is` `false`, this will alert all members & leads of the team
```
slackUsername opened this PR. Needs *peer* and *lead* reviews @Group_Slack_Name
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```
2) If `Members_Before_Leads` is `true`, Alerting only members of the team
```
slackUsername opened this PR. Needs *peer* and *lead* reviews @slackMember1 @slackMember2 @slackMember3
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```

**Example**:

![GitHub-PR-Bot-Opened-Test](./videos/)

#### Closed
When a pull request is closed, there are two possible formats:

1) When the user who opened the PR closes the PR
``` 
slackUsername has closed this PR.
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```
2) When the user who opened the PR differs from the user who closed it
```
slackUsername has closed this PR. Owner: @SlackUserOwner
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```
**Example**:

![GitHub-PR-Bot-Closed-Test](./videos/)

#### Approved
When a pull request is approved, there is only one format:

```
slackUserName has approved this PR. Owner: @SlackUserOwner
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```

**Example**:

![GitHub-PR-Bot-Approved-Test](./videos/)

#### Changes Requested
When a pull request has changes requested, there is only one format:

```
slackUserName has requested changes to this PR. Owner: @SlackUserOwner
Pull Request Title  [https://github.com/Organization/Repository/pull/###]
```

**Example**:

![GitHub-PR-Bot-Opened-Test](./videos/)

#### Commented
When a pull request has been commented on, there is only one format

**Example**:

![GitHub-PR-Bot-Opened-Test](./videos/)

#### Merged

**Example**:

![GitHub-PR-Bot-Opened-Test](./videos/)

### Slack Slash Commands
**Preface**: To use these slash commands, an app should be created in an organization's slack account.
After creating an app, a bot should be able to be created.

This bot can be configured to provide slash commands any user can use, provided the app is a member of the channel.

The slash commands currently supported are:

1) `/echo`
2) `/my-queue`
3) `/team-queue`
4) `/get-queue`
5) `/fixed-pr`

Expected Slack Bot slash commands

![Slack-Online-Bot-Slash-Commands](./images/Expected-Slack-Slash-Commands-Setup.png)

#### Echo
The `/echo` command is used to verify that your PR Bot infrastructure is setup correctly for enabling slash commands.

**Expected Use**: `/echo`

**Example**:

![GitHub-PR-Bot-Echo-Test](./gifs/Slash-command-echo-test.gif)

#### My Queue
**Note:** Slack user using this command should be a member or lead of a team

When team members or leads create pull requests, users are responsible for reviewing them.
The `/my-queue` command is used to retrieve a slack user's personal queue of pull requests they should review.

To use, enter the slash command in your slack chat.

**Expected Use**: `/my-queue`

**Empty Queue Example**: 

![GitHub-PR-Bot-My-Queue-Empty-Test](./gifs/Slash-command-my-queue-empty-test.gif)

**Non-Empty Queue Example**:

![GitHub-PR-Bot-My-Queue-Non-Empty-Test](./gifs/Slash-command-my-queue-non-empty-test.gif)

#### Team Queue
**Note:** Slack user using this command should be a member or lead of a team

The `/team-queue` command is used to retrieve a team's current list of statuses for pull requests created by team members or leads.
This list will show pull requests in four major categories:

1) Which pull requests are currently mergeable (Received all required peer & lead approvals)
2) Which pull requests need lead approvals
3) Which pull requests need peer approvals
4) Which pull requests need lead & peer approvals

To use, enter the slash command in your slack chat.

**Expected Use**: `/team-queue`

**Empty Queue Example**:

![GitHub-PR-Bot-Team-Queue-Empty-Test](./gifs/Slash-command-team-queue-empty-test.gif)

**Non-Empty Queue Example**:

![GitHub-PR-Bot-Team-Queue-None-Empty-Test](./gifs/Slash-command-team-queue-non-empty-test.gif)

#### Get Queue
The `/get-queue` command is used to retrieve another user or team's queue.
This can be used to gain perspective of another user or team's current pull request workload.
This command is intended for people not directly involved with the team.
This allows slack users outside the team to view team activities and active pull requests.

To use, enter the slash command in your slack chat accompanied by @'ing a slack user or slack team.

**Expected Use**: `/get-queue @SlackUser` OR `/get-queue @SlackTeam`

**One Queue Example**:

![GitHub-PR-Bot-Get-Queue-One-Test](./gifs/Slash-command-get-queue-one-test.gif)

**Multiple QueueS Example**:

![GitHub-PR-Bot-Get-Queue-Many-Test](./gifs/Slash-command-get-queue-many-test.gif)

#### Fixed PR
For reference, when one or more users request changes on a pull request, the pull request is moved.
The pull request is removed from the queue of user requesting changes, and added to the pull request owner's queue.
This is done to demonstrate it's the pull request owner's responsibility to address necessary changes.

The `/fixed-pr` command is used to tell all users who have requested changes on an owner's pull request, that revisions have been made.
This command removes the PR from the owner's queue, and adds it back to the queue of users who requested changes.

To use, enter the slash command in your slack chat accompanied by the pull request url.

**Expected Use**: `/fixed-pr https://github.com/Organization/Repository/Pull/###`

**Example**:

![GitHub-PR-Bot-Fixed-PR-Test](./gifs/)

## Setup 

### Deploying AWS Infrastructure
The first step is to deploy an AWS infrastructure. There are three different configuration options, depending on the desired performance. See [Architecture](#architecture).

**IMPORTANT:** Deploying all infrastructure, does not mean comitting to always allowing github notifications or slack slash commands. The [options](#options) `Disable_GitHub_Alerts` will disable GitHub notifications to Slack, and `Disable_Dynamo` will disable Slack messages since PR statuses can't be maintained in DynamoDB. Changing these two options for a specific, or all, team(s) and redeploying the lambdas will immediately apply the change in messaging.

As a result, it's advocated to use the [Overall Architecture](#overall-architecture) starting out to understand how GitHub notifications and Slack slash commands will affect team performance. If GitHub notifications become too overbearing or Slack slash commands don't provide much value, you can redeploy with these options disabled.

To deploy your architecture, you will need to have an AWS account.<br>
After creating one or logging in, follow the following steps:

1) From the AWS Management Console, Enter `Cloudformation` and select it
3) On the top left, press the `Create Stack` button
4) From the `Choose Template` option, choose to upload a template
5) Press the `Choose File` button and navigate to this repository
6) Go to the infrastructure folder, your desired architecture folder, and select the **cft.yaml** file
7) Press `Next` on the bottom right
8) You will be prompted to enter a `Stack Name`. You can set this to `PR-Bot-Infra-Stack` or your desired stack name preference
9) The parameters are also up to user preference. These names or Resource ARNs will be used in the next step
10) Press `Next` once the `Stack Name` and all parameters have unique values
11) Press `Next` on the bottom right again to avoid optional settings
12) Pesss `Create` on the bottom right to create the stack for your infrastructure

### Creating Slack App and Bot
In your Slack application, navigate to your [organization's apps](https://api.slack.com/apps). Press the `Create New App` button. Give the App the name `PR-Bot` and assigned it to your organization's workspace. Press the `Create App` button.

On the left sidebar, click on `Bot Users`. Select `Add a Bot User`. Enter a valid display name and username for the bot.

Select `Oauth & Permissions` on the left sidebar, and press `Install App to Workspace`. You will prompted to authorize the app access to your organization's workspace. Press `Allow` to allow access.

With your Slack app and bot setup, we can start the process to deploy the lambdas.

### Deploying Lambdas

#### Creating a JSON Config
An example [JSON config file](#json-config-format) is provided for context. 

The steps below will detail the steps to create your organization's config file along with an example underneath for comparison.

From the json.ts file found at `./src/json/src/json.ts`, you should see:
```
export const json = {
  Departments: {}
};
```

1. Determine the different departments or groups that will use this application. These departments can be named anything following pascal, camel, or snake case. Add them to the json as such:
```
export const json = {
  Departments: {
    DevDepartment: {},
    qaDepartment: {},
    Department_for_PROD: {}
  }
};
```
2. Determine the number and names of teams for each department. These team names can be named anything following pascal, camel, or snake case. Add them to the json as such:
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {},
      SouthernTeam: {}
    },
    qaDepartment: {
      WeFindAllTheBugs: {}
    },
    Department_for_PROD: {
      OnlyProdTeam: {}
    }
  }
};
```
3. Add the `Options` property and all options properties for each team.
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 10,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 2,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        }
      },
      SouthernTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":happy:",
          X_Mark_Text: ":angry:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: true,
        }
      }
    },
    qaDepartment: {
      WeFindAllTheBugs: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 0,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: false,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 0,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        }
      }
    },
    Department_for_PROD: {
      OnlyProdTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: false,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        }
      }
    }
  }
};
```
4. Add the `Slack_Group` property to each team. Set the `Slack_Name` to the name of the team. Go [here](https://api.slack.com/methods/usergroups.list/test) to retrieve your organization's slack user groups. After pressing `Test Method`, search (Ctrl+F) for your team name. Set `Slack_Id` to `<!subteam^[YOUR TEAM'S USER GROUP ID]|[YOUR TEAM'S USER GROUP HANDLE]>`. 
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 10,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 2,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "The Mighty Ducks",
          Slack_Id: "<!subteam^SE2FY1HHA|mightyducks>
        }
      },
      SouthernTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":happy:",
          X_Mark_Text: ":angry:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: true,
        },
        Slack_Group: {
          Slack_Name: "The Southerners",
          Slack_Id: "<!subteam^ABCDEFHHA|southerners>
        }
      }
    },
    qaDepartment: {
      WeFindAllTheBugs: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 0,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: false,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 0,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "We Find All The Bugs",
          Slack_Id: "<!subteam^9876Y1HHA|findingbugs>
        }
      }
    },
    Department_for_PROD: {
      OnlyProdTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: false,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "PROD",
          Slack_Id: "<!subteam^XYZFY1555|prod>
        }
      }
    }
  }
};
```
5. Add `Users` property to each team. Add a `Leads` and `Members` property within each `Users` property.
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 10,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 2,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "The Mighty Ducks",
          Slack_Id: "<!subteam^SE2FY1HHA|mightyducks>
        },
        Users: {
          Leads: {},
          Members: {}
        }
      },
      SouthernTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":happy:",
          X_Mark_Text: ":angry:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: true,
        },
        Slack_Group: {
          Slack_Name: "The Southerners",
          Slack_Id: "<!subteam^ABCDEFHHA|southerners>
        },
        Users: {
          Leads: {},
          Members: {}
        }
      }
    },
    qaDepartment: {
      WeFindAllTheBugs: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 0,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: false,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 0,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "We Find All The Bugs",
          Slack_Id: "<!subteam^9876Y1HHA|findingbugs>
        },
        Users: {
          Leads: {},
          Members: {}
        }
      }
    },
    Department_for_PROD: {
      OnlyProdTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: false,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "PROD",
          Slack_Id: "<!subteam^XYZFY1555|prod>
        },
        Users: {
          Leads: {},
          Members: {}
        }
      }
    }
  }
};
```
6. Within each `Leads` property, add keys based on GitHub usernames of team leads. Within each `Members` property, add keys based on GitHub usernames of team members.
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 10,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 2,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "The Mighty Ducks",
          Slack_Id: "<!subteam^SE2FY1HHA|mightyducks>
        },
        Users: {
          Leads: {
            gwely: {}
          },
          Members: {
            EthanTPainter: {},
            joshuajharris: {}
          }
        }
      },
      SouthernTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":happy:",
          X_Mark_Text: ":angry:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: true,
        },
        Slack_Group: {
          Slack_Name: "The Southerners",
          Slack_Id: "<!subteam^ABCDEFHHA|southerners>
        },
        Users: {
          Leads: {
            dinkzilla: {},
            crewsha: {}
          },
          Members: {
            DillionSykes: {},
            dlarner3194: {}
          }
        }
      }
    },
    qaDepartment: {
      WeFindAllTheBugs: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 0,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: false,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 0,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "We Find All The Bugs",
          Slack_Id: "<!subteam^9876Y1HHA|findingbugs>
        },
        Users: {
          Leads: {
            chrisbillups: {}
          },
          Members: {
            tswisher: {}
          }
        }
      }
    },
    Department_for_PROD: {
      OnlyProdTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: false,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "PROD",
          Slack_Id: "<!subteam^XYZFY1555|prod>
        },
        Users: {
          Leads: {
            iconx: {}
          },
          Members: {
            "subay-dhungel": {}
          }
        }
      }
    }
  }
};
```
7. For each GitHub username key, add a `Slack_Name` and `Slack_Id`. The `Slack_Name` is the display name, and the `Slack_Id` is the name used to alert a user.
```
export const json = {
  Departments: {
    DevDepartment: {
      TheMightyDucks: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 10,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 2,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "The Mighty Ducks",
          Slack_Id: "<!subteam^SE2FY1HHA|mightyducks>
        },
        Users: {
          Leads: {
            gwely: {
              Slack_Name: "Andrew",
              Slack_Id: "<@U02NUAAAA>"
            }
          },
          Members: {
            EthanTPainter: {
              Slack_Name: "Ethan",
              Slack_Id: "<@U02NUBBBB>"
            },
            joshuajharris: {
              Slack_Name: "Joshua",
              Slack_Id: "<@U02NUCCCC>"
            }
          }
        }
      },
      SouthernTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":happy:",
          X_Mark_Text: ":angry:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: true,
        },
        Slack_Group: {
          Slack_Name: "The Southerners",
          Slack_Id: "<!subteam^ABCDEFHHA|southerners>
        },
        Users: {
          Leads: {
            dinkzilla: {
              Slack_Name: "MattyIce",
              Slack_Id: "<@U02NUDDDD>"
            },
            crewsha: {
              Slack_Name: "Harrison",
              Slack_Id: "<@U02NUEEEE>"
            }
          },
          Members: {
            DillionSykes: {
              Slack_Name: "D. Dog",
              Slack_Id: "<@U02NUFFFF>"
            },
            dlarner3194: {
              Slack_Name: "Daniel (I'm not a rapper tho)",
              Slack_Id: "<@U02NUGGGG>"
            }
          }
        }
      }
    },
    qaDepartment: {
      WeFindAllTheBugs: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 0,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: false,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: false,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 0,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "We Find All The Bugs",
          Slack_Id: "<!subteam^9876Y1HHA|findingbugs>
        },
        Users: {
          Leads: {
            chrisbillups: {
              Slack_Name: "Chris",
              Slack_Id: "<@U02NUHHHH>"
            }
          },
          Members: {
            tswisher: {
              Slack_Name: "Tim",
              Slack_Id: "<@U02NUIIII>"
            }
          }
        }
      }
    },
    Department_for_PROD: {
      OnlyProdTeam: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: false,
          Queue_Include_Approval_Names: false,
          Queue_Include_Req_Changes_Names: false,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: false,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "PROD",
          Slack_Id: "<!subteam^XYZFY1555|prod>
        },
        Users: {
          Leads: {
            iconx: {
              Slack_Name: "Antonio",
              Slack_Id: "<@U02NUJJJJ>"
            }
          },
          Members: {
            "subay-dhungel": {
              Slack_Name: "Subay",
              Slack_Id: "<@U02NUKKKK>"
            }
          }
        }
      }
    }
  }
};
```
That completes the JSON configuration process.

#### Setting Environment Variables
At the root level, create a file `.env`. This will be used to store all of your environment variables.

The application already provides default values for most of the [environment variables](#environment-variables). There are however those that **must** be supplied by the user. Those variables will be covered here:

1. S3_BUCKET_NAME

When you created the AWS infrastructure, you supplied the parameter `S3BucketName` with a value. If you need to find the s3 bucket, go to the AWS Management Console, enter S3, and select it. Search for the pr-bot s3 bucket for help finding it.

2. GITHUB_OAUTH2_TOKEN

The GitHub Oauth2 Token can be created via [instructions from GitHub](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). Make sure the token has access to public and private repositories.

3. DYNAMO_TABLE_NAME

When you created the AWS infrastructure you supplied the parameter `DynamoTableName` with a value. Copy the name used to create the Dynamo table.

4. SNS_ARN

After deploying the AWS infrastructure, type `SNS` into the AWS Management Console. Select SNS and search for the name you gave to your PR bot sns. Under `Details`, view the `ARN` associated value. Copy the arn.

5. SQS_ARN

After deploying the AWS infrastructure, type `SQS` into the AWS Management Console. Select SQS and search for the name you gave to your PR bot sqs. Under `Details`, view the `ARN` associated value. Copy the arn.

6. SLACK_BOT_TOKEN

Return to your [organization's Slack Apps](https://api.slack.com/apps) and select your PR Bot App. Navigate to `Oauth & Permissions` on the left sidebar, and copy the `Bot User OAuth Access Token`.

At this point, your current `.env` file should appear similar to this:
```
S3_BUCKET_NAME="pr-bot-s3-bucket"
GITHUB_OAUTH2_TOKEN="9d987...."
DYNAMO_TABLE_NAME="pr-bot-table"
SNS_ARN="arn:aws:sns:..."
SQS_ARN="arn:aws:sqs:..."
SLACK_BOT_TOKEN="xoxb-..."
```

7. Add All team names from your `./src/json/src/json.ts` to `src/required-envs.ts`

The class `EnvModel` should have the team names added in the following format:
```
[TEAM_NAME]_SLACK_CHANNEL_NAME: string
```
The `const requiredEnvs` should have the team names also added in the following format:
```
[TEAM_NAME]_SLACK_CHANNEL_NAME: str(),
```

For further assistance, this is how we would add team names from the example provided earlier in [Creating a JSON Config](#creating-a-json-config):

```
export class EnvModel {
  ...
  TheMightyDucks_SLACK_CHANNEL_NAME: string;
  SouthernTeam_SLACK_CHANNEL_NAME: string;
  WeFindAllTheBugs_SLACK_CHANNEL_NAME: string;
  OnlyProdTeam: string;
}

export const requiredEnvs = envalid.cleanEnv<EnvModel>(process.env, {
  ...
  TheMightyDucks_SLACK_CHANNEL_NAME: str();
  SouthernTeam_SLACK_CHANNEL_NAME: str();
  WeFindAllTheBugs_SLACK_CHANNEL_NAME: str();
  OnlyProdTeam: str();
}
```

#### Running Deploy Scripts

After setting all environment variables, run the following scripts:

```
npm i
npm run build
npm run deploy:dev
```
This will deploy your lambdas with a `dev` stage. You can deploy lambdas with a `qa` or `prod` stage with `npm run deploy:qa` or `npm run deploy:prod` respectively. After serverless deploys your lambdas, look at the output of the deploy to view `endpoints`. Under it, you should a `POST - URL`. Copy the URL. It will be needed for later.

If you want your application to use Slack slash commands, run:
```
npm run dynamo:init
```
This will initialize the Dynamo table with all of your User and Slack_Group Slack Ids and their queues.

### Adding GitHub Webhooks
Now that our AWS infrastructure and lambdas are deployed, we need to connect our public or private repositories to our lambda.

For each of the GitHub repositories you wish to connect to the PR Bot, follow the following steps:
1) Select the `Settings` tab on the top right.
2) From the left menu, select `Webhooks`. 
3) Paste your URL from the previous stage into the `Payload URL` text box. 
4) Change the content-type to `application/json`. 
5) Under `Which events would you like to trigger this webhook?`, select the radio button for individual events. 
6) Check the box for `Pull requests` and `Pull request reviews`.

### Creating Slack slash commands
Return to your [Slack Apps](https://api.slack.com/apps) and select the PR Bot app. 

Under `Features` on the left sidebar, select `Slash Commands`. Press `Create New Command`.

The following list will describe how to setup each command.

**Note**: The Request URL is the same for each command. For `Request URL`, paste the URL from the serverless deploy `endpoint`. This is the same URL you pasted in the GitHub webhook Payload URL. Also make sure to enable escape channels, users, and links sent to your app for **each** slash command.

![Slash-commandEscape-enbaled](./images/Slash-command-enable-escape.png)

#### Creating Echo
For `Command`, enter `/echo`.

This command is used only for verifying that a slack slash command can be used and a user will receive an output.

#### Creating My Queue
For `Command`, enter `/my-queue`.

This command is used to retrieve a user's list of PRs to review.
#### Creating Team Queue
For `Command`, enter `/team-queue`

This command is used to retrieve a team's list of PRs. This includes all PRs created by members or leads in the team.

#### Creating Get Queue
For `Command`, enter `/get-queue`.

This command is used to retrieve a specified user or team queue.

Expected use: `/get-queue @SlackUser` or `/get-queue @SlackTeam`

#### Creating Fixed PR
For `Command`, enter `/fixed-pr`.

This command is used to tell any and all users who requested changes on a PR, that the proper revisions have been made and should be reviewed again.

Expected use: `/fixed-pr https://github.com/organization/repository/pull/###`

## Architecture

### Overall Architecture
**IMPORTANT**: Deploying all infrastructure

If this application will be used to:
1) Receive slack messages in your team's slack channel from GitHub
2) Use the Slack PR bot slash commands to receive PR statuses 

Architecture Diagram

![GitHub-PR-Bot-Overall-Architecture](./images/GitHub-PR-Bot-Architecture-Diagram.png)

#### Explanation
GitHub will send events to the lambda **only** about PR changes. All used event types are described in [GitHub Notifications](#github-notifications).
A Slack bot will send slash command events to the same lambda as the GitHub webhook is making requests to.
The first lambda will process requests and publish each to an SNS. The SNS will send these messages to a subscribed SQS.
A second lambda will be listening to the SQS, and pull off messages as they appear.
With DynamoDB enabled, a dynamo table will keep a status of current PRs (who has approved them, who has request changes, etc.).
The lambda will finish by sending an alert/notification to the Slack channel belonging to the team.

### GitHub Notifications Only
If this appplication will only be used to:
1) Receive slack messages in your team's slack channel from GitHub

Architecture Diagram

![GitHub-PR-Bot-GitHub-Notifications-Only](./images/GitHub-PR-Bot-Architecture-Diagram-only-github.png)

*Note*: The SQS is not a standard SQS queue. It must be a FIFO (first-in-first-out) queue.
This is set to enable exactly once delivery to lambdas, preventing duplicate alerts
sent to a Slack channel.

#### Explanation

GitHub will send events to the lambda **only** about PR changes. All used event types are described in [GitHub Notifications](#github-notifications).
The first lambda will process GitHub events and publish them to a FIFO queue.
The second lambda listens to the FIFO queue and pulls off any available messages.
The lambda then processes the event and sends a Slack message to a team's slack channel.

### Slack Slash Commands Only
If this application will only be used to:
1) Use the Slack PR bot slash commands to receive PR statuses 

Architecture Diagram

![GitHub-PR-Bot-Slack-Slash-Commands-Only](./images/GitHub-PR-Bot-Architecture-Diagram-only-slash-commands.png)

#### Explanation
This architecture nearly mirrors the architecture used for [Overall Architecture](#overall-architecture).
If there are no existing GitHub webhooks connected to the first lambda, only Slack slash commands will make requests.
If there are existing webhooks connected to the first lambda, make sure to set `Disable_GitHub_Alerts` to `true`.

Slack slash commands will be processed by the first lambda. All slack slash commands are found [here](#slack-slash-commands).
The first lambda will process and publish messages to a standard SQS.
The second lambda will poll the SQS for messages, process them, and post the result back to slack user who made the request.

## Basic Structure

Configuration variables are separated into 2 categories: 
1) Environment Variables
2) JSON Team Option Variables

The environment variables listed either contain confidential data, 
infrastructure setup, or data to be preserved outside of comitting to a 
GitHub repository. These include GitHub OAuth tokens, SNS/SQS Arns, 
and Dynamo table information.

The JSON config variable contains information that can be committed 
and pushed to a GitHub repository. This information is public or 
generic enough to not expose tokens, infrastructure, or security 
for an organization's setup. JSON config files are located located at `/src/json/src/`. 

### Environment Variables

All required environment variables are provided in the file: `.env.deploy.template`.

The table below will go further into detail about each variable and it's purpose.

Environment Variable | Description | Values 
-------------------- | ----------- | ------ 
**LOG_LEVEL**: *string* | The specified log level for the application's dedicated logger. <br> Log levels are separated into 4 main categories: info, debug, warn, and error. When a log level is selected (i.e. "info"), all log statements with this log level are recorded in Cloudwatch for review or inspection. <br><br> When testing locally, it is recommended to use the `info` log level. When deploying this application, it is recommended to use the`debug` log level. | There are 4 valid values: <br> 1) `info` <br> 2) `debug` <br> 3) `warn` <br> 4) `error`. <br><br> If not set, the application defaults to `debug`
**SLS_DEBUG**: "*" | To hide serverless warnings about sls debug when deploying to AWS | Automatically Set to `"*"`
**DISABLE_XRAY**: *boolean* | [AWS XRay](https://aws.amazon.com/xray/) is a tracing service allowing dev and production teams to determine time consuming requests or error prone services in their infrastructure. | If you want to disable tracing or logging through this service, set this to `true`. <br><br> If you'd like receive tracing and logging staistics about requests set this to `false` <br><br> Application defaults to `false`
**S3_BUCKET_NAME**: *string* | The name of the S3 Bucket to create and store artifacts for serverless lambda deploys | Can set to any value as the name of the S3 Bucket. <br><br> Examples: <br> `pr-bot-s3-bucket`, `pr-bot-bucket`, etc.
**GITHUB_OAUTH2_TOKEN**: *string* | A GitHub OAuth2 token allows the user to make requests using [GitHub API](https://developer.github.com/v3/) to public or private repositories. <br> If making requests to private repositories, make sure to have a GPG key registered to your account to enable API requests. | Should be a string of hexadecimal characters `abcd.....`. If you don't intend to use GitHub notifications, set this to a dummy value (eg. "123")
**SLACK_API_URI**: *string* | The base uri for using Slack API. <br> Each function that uses a specific API method appends the proper function the base uri. Example: Using `postMessage` function in this application will make a request to `https://slack.com/api/chat.postMessage`. | Always set to `"https://slack.com/api"`, and is set by default as well.
**[YOUR_FIRST_TEAM_NAME]_SLACK_CHANNEL_NAME**: *string* | The name of your team's slack channel. <br><br> Examples: `DEVS_SLACK_CHANNEL_NAME`, `MY_TEAM_SLACK_CHANNEL_NAME`, `GENERAL_SLACK_CHANNEL_NAME`, etc. <br><br> | Set to `[YOUR TEAM NAME]` + `_SLACK_CHANNEL_NAME`
**SLACK_BOT_TOKEN:**: *string* | This is required for any message request/response with Slack channels. To send alerts and messages through a third party application to Slack, you will need to create an [App](https://api.slack.com/apps) in Slack. <br> After creating an App, create a bot for you app. Creating a bot will provide you with a user token and bot token. Copy the bot token and paste it here. <br><br> **Note**: This application only expects one bot to exist per application instance. This is ideal for organizations or departments using slack. | Should match the format `xoxb-1234567890-123456789012-ABCDEFGHIJKLMNOPQRSTUVWX`
**DYNAMO_TABLE_NAME**: *string* | Name of your table in your Dynamo account. If Dynamo is enabled, this table will be used to record actively maintained queue's of each user and team. <br> Using a Dynamo table enables the use of slash commands to utilize the table's storage. | Any string value meeting AWS DynamoDB table naming standards. <br><br> Example table name: `pull-requests-table`
**DYNAMO_API_VERSION:** *string* | The API Version of the AWS DynamoDB Client | This application uses version `2012-08-10` and is set by default.
**DYNAMO_REGION:** *string* | Specify the AWS Dynamo Region for the Dynamo table to exist | Supply values similar to AWS Region. <br><br> Example inputs are: <br> `us-east-1` for eastern United States <br> `us-west-1` for western United States
**SQS_ARN:** *string* | Provide the SQS ARN to use to send and retrieve messages from this SQS. | follows the AWS SQS ARN format of `arn:aws:sqs:us-east-1:12345678:PR-Bot-Sqs`
**SQS_API_VERSION**: *string* | The API Version of the AWS SQS client | This application uses version `2012-11-05` and is set by default.
**SNS_ARN:** *string* | Provide the SNS ARN to use publish messages to this SNS. | Follows the AWS SNS ARN format of `arn:aws:sns:us-east-1:12345678:PR-Bot-Sns`
**SNS_API_VERSION**: *string* | The API Version of the AWS SNS Client | This application uses version `2010-03-31` and is set by default.
**INTEGRATION_TEST_DYNAMO_TABLE_NAME:** *string* | The name of the test dynamo table for running integration tests with Dynamo | The name used as a parameter to create the test table in the `infrastructure` folder should also be copied to be used here. The application uses the name `pr-bot-dynamo-test-table` as a default dynamo test table name

### Options

Options are provided to allow customization of the application per slack team.
This allows each team to determine whether member reviews should come before lead reviews,
how many member approvals are required, how many lead approvals are required, etc.

All of the described options are expected to be supplied with values, 
or errors will be thrown. The file [raw-example.ts](./src/json/src/raw-example.ts) provides a raw format of the JSON object. The file [real-example.ts](./src/json/src/real-example.ts) provides a completed JSON object with valid team names, github usernames, and slack id's for reference.

Option  |   Description   |   Values
------- | --------------- | ---------
**Avoid_Slack_Channel_Comment_Alerts_Time_Window:** *number* | When a user comments on a PR, an alert is sent to that user's team slack channel. When a user leaves multiple comments in a short period of time, on one PR, a slack channel could a message about each comment. <br><br> Viewing 5 slack messages each telling the team:<br> `user X has commented on pull request Y` <br> provides as much benefit as one slack message with the same message. <br><br> As a result, a window is provided to limit how often a slack channel can be alerted when a PR is commented on by the same user on the same PR multiple instances in a short period of time | If set to `0`: <br><br> when a user **X** comments on pull request **Y** always send an alert to the team channel anytime a user comments on a PR (**no delays or restrictions**). <br><br> If set to `10`: <br><br> **1**) When a user **X** comments on pull request **Y** send an alert to the team channel from user **X** on pull request **Y** <br>**2**) Any comments from user **X** at this time until `10` minutes after will not be sent to the team's slack channel <br>**3**) After `10` minutes have passed, if user **X** comments on pull request **Y** 
**Check_Mark_Text**: *string* | Slack text for representing a check mark icon in slack. This is used to show approval of PRs | Use `:heavy_check_mark:` for a green check mark Slack icon <br><br> Use `:white_check_mark:` for a white check mark Slack icon <br><br> Or use your own text value to represent a check mark in your slack team channel!
**X_Mark_Text:** *string* | Slack text for representing an X mark icon in slack | Use `:X:` for a bright red x mark  Slack icon <br><br> Use `:heavy_multiplication_x:` for an orange x mark Slack icon <br><br> Or use your own text value to represent an X mark icon in slack!
**Queue_Include_Created_Time:** *boolean* | When using slash commands to retrieve queues, should each PR description include the time the PR was created? | Set to `true` if you want to see the date and time the pr was created. Set to `false` if you don't want to see the date and time the pr was created. <br><br> **Example**: `PR Title [PR URL]  | Created: ISO Timestamp`
**Queue_Include_Updated_Time:** *boolean* | When using slash commands to retrieve queues, should each PR description include the time the PR was last updated? | Set to `true` if you want to see the date and time the pr was last updated. Set to `false` if you don't want to see the date and time the pr was last updated. <br><br> **Example**: `PR Title [PR URL]  | Updated: ISO Timestamp`
**Queue_Include_Approval_Names:** *boolean* | When using slash commands to retrieve queues, should each PR description include the names of users who have approved the pull request? | Set to `true` to include leads and members who appproved the PR in the PR description. Set to `false` to exclude leads and members who approved the PR in the PR description. <br><br> **Examples** <br> 1) A Lead and Member approved <br>`PR Title [PR URL] | Leads Approving: @SlackLead1 | Members Approving: @SlackMember1` <br> 2) Only one lead approved <br> `PR Title [PR URL] | Leads Approving: @SlackLead1` <br> 3) Only one member approved <br> `PR Title [PR URL] Members Approving: @SlackMember1`
**Queue_Include_Req_Changes_Names:** *boolean* | When using slash commands to retrieve queues, should each PR description include the names of users who have requested changes to the pull request? | Set to `true` to include leads and members who erquested changes in the PR description. Set to `false` to exclude leads and members who have requested changes in the PR description. <br><br> **Examples** <br> 1) A Lead and Member requested changes <br> `PR Title [PR URL] | Leads Request Changes: @SlackLead1 | Members Request Changes: @SlackMember1` <br> 2) Only one lead requested changes <br> `PR Title [PR URL] | Leads Request Changes: @SlackLead1` <br> 3) Only one member requested changes <br> `PR Title [PR URL] | Members Request Changes: @SlackMember1`
**Queue_Include_Owner:** *boolean* | When using slash commands to retrieve queues, should each PR description include the names of Owner of the PR? | Set to `true` to include the name of the PR owner in the PR description. Set to `false` to exclude the owner of the PR from the PR description. <br><br> **Example**: `PR Title [PR URL] | Owner: SlackOwner`
**Queue_Include_New_Line:** *boolean* | When using slash commands to retrieve queues, should each PR description include the a new line? <br><br> After the PR title and URL, you may feel it's necessary to move Leads & members approving and requesting changes to a new line for better formatting | Set to `true` to move all information provided by **Queue_Include_** options to a new line. Set to `false` to keep all **Queue_Include** information on one line. <br><br> Examples (Note "\n" denotes new line character) <br> 1) When set to `true` <br> `PR Title [PR URL]\n| Owner: SlackOwner | Created: ISO Timestamp | Updated: ISO Timestamp` <br> 2) When set to `false` <br> `PR Title [PR URL] | Owner: SlackOwner | Created: ISO Timestamp | Updated: ISO Timestamp`
**Num_Required_Member_Approvals:** *number* | Number of required member approvals for a pull request | Set to `0`: <br> no members of the team are required to approve pull requests. <br><br> Set to `2`: <br> only two members of a team are required to approve a pull request
**Num_Required_Lead_Approvals:** *number* | Number of required lead approvals for a pull request | Set to `0`: <br> no leads of the team are required to approve the pull request <br><br> Set to `2`: <br> only two leads of a team are required to approve a pull request

### JSON config format

Below is an example JSON config for a developer team.
The team name is `Dev_Team_1`. The team has one lead and 4 members.

```zsh
export const json = {
  Departments: {
    Dev: {
      Dev_Team_1: {
        Options: {
          Avoid_Slack_Channel_Comment_Alerts_Time_Window: 5,
          Check_Mark_Text: ":heavy_check_mark:",
          X_Mark_Text: ":X:",
          Queue_Include_Created_Time: true,
          Queue_Include_Updated_Time: true,
          Queue_Include_Approval_Names: true,
          Queue_Include_Req_Changes_Names: true,
          Queue_Include_Owner: true,
          Queue_Include_New_Line: false,
          Num_Required_Lead_Approvals: 1,
          Num_Required_Member_Approvals: 1,
          Member_Before_Lead: true,
          Disable_Dynamo: false,
          Disable_GitHub_Alerts: false,
        },
        Slack_Group: {
          Slack_Name: "Group_Slack_Name",
          Slack_Id: "<!subteam^USER_GROUP_ID|handle>",
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

The first key, `Departments`, is required. However, the next two layers of keys, `Dev` and `Dev_Team_1`, are completely renameable.
The department name `Dev` could be changed to `QA`, `Prod`, `Unknown_Department`, etc.
The team name `Dev_Team_1` can be changed to `DevTeam`, `BestTeam`, etc.

Within each team key, such as `Dev_Team_1`, there **must** be the following keys: `Options`, `Slack_Group`, and `Users`.

The `Options` key should have all of the properties described [here](#options).

The `Slack_Group` key should have `Slack_Name` and `Slack_Id` properties.
The `Slack_Name` property is the display name of the team. This name is used to reference users/teams without alerting them.
The `Slack_Id` property is the Slack code format for making a reference to a Slack Team.
This Slack Id, when used, alerts the user or users of the team.

The `Users` object has two keys: `Leads` and `Members`.
On `Leads` and `Members`, keys denote the GitHub usernames of people on the team.

Here is an example with a `Leads` key set to [gwely](https://github.com/gwely) and a `Members` key set to [EthanTPainter](https://github.com/EthanTPainter)
```
Leads: {
  gwely: {
    Slack_Name: Andrew Curcie,
    Slack_Id: <@ABCD1234>
  }
}
Members: {
  EthanTPainter: {
    Slack_Name: Ethan Painter,
    Slack_Id: <@ABCD2345>
  }
}
```

The `Slack_Name` and `Slack_Id` properties on each lead and member represent the same information provided above about the `Slack_Group`.
The `Slack_Name` describes the user's name without directly referencing, or alerting them on Slack. Can be set to any name.
The `Slack_Id` describes the user's Slack reference, used to directly alert them of a message from the PR Bot. Set ID provided through slack (format: `<@UBP6A5PUL>`)

To view your organization's users and find your team's slack IDs, I'd recommend this [Slack API tester](https://api.slack.com/methods/users.list/test).
The `users.list` should list all slack users in the organization, allowing you to search it for names and find the corresponding IDs.
