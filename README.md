<h1 align="center">
  <br>
  <a href="http://www.amitmerchant.com/electron-markdownify"><img src="https://i.imgur.com/njuVb1g.png" alt="Markdownify" width="200"></a>
  <br>
  Games API
  <br>
</h1>

## What is it?

An API to handle most of the things related to XTeam Games. With this API a game dev can publish their game within the XTeam Universe (XTU). They can also manage things like CRUD leaderboards, CRUD achievements, and CRUD Items. Monitor game's usage data, and authenticate with the same user across all XTU platforms.

The Admin Panel (Frontend APP) is connected to this API allowing XTeam admins to run games on Slack (like The Tower and The Arena) and the rest of the things a regular game dev can do.

## Contents

* [Tech Stack](#tech-stack)
* [Requirements](#requirements)
* [Project](#project)
	* [Database](#database)
    	* [New Migration](#new-migration)
    * [Environmental Variables](#environmental-variables)
    * [API](#api)
    	* [API Documentation](#api-documentation)
* [How to contribute](#how-to-contribute)
	* [JIRA](#jira)
    * [Commits](#commits)
    * [Pull Requests](#pull-requests)
* [Continous Integration](#continous-integration)
* [Documentation](#documentation)

## 📦Tech Stack
* [Node.js](https://nodejs.org/)
* [Hapi](https://hapi.dev/)
* [Sequelize v5](https://sequelize.org/v5/)
* [PostgreSQL](https://www.postgresql.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Mocha](https://mochajs.org/) - [Chai](https://www.chaijs.com/) - [Sinon](https://sinonjs.org/)
- [Swagger](https://swagger.io/)

## 🔎Requirements
* [Docker](https://www.docker.com/)
* [NVM - Node Version Manager](https://github.com/nvm-sh/nvm)

## 🚀Project
Let's setup the project!🥹

### **📟Database**
Spin up the containers by running one of these two commands:

```bash
docker-compose up -d
```

You can now access the DB with your favorite client. If you don't use any, we recommend you [OmniDB](https://github.com/OmniDB/OmniDB)

#### **🆕New Migration**
Create a new migration file running: `npm run db:migrate:add some-new-table-name`.

Change the extension of the created file from `.js` to `.ts`.

Paste the following template to your migration:

```typescript
import type { QueryInterface, Sequelize } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
    
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
    
    });
  },
};

```

Implement those two functions. `up` is the migration and `down` is the reverse of it. For example, in order to add a new column `isEnabled` to the `Game` table:

```typescript
import type { QueryInterface, Sequelize } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
    	await queryInterface.addColumn('Game', 'isEnabled', { type: Sequelize.BOOLEAN }, { transaction });
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
    	await queryInterface.removeColumn('Game', 'isEnabled', { transaction });
    });
  },
};
```

Now modify the model class, `Game.ts` in this case, and add a new field:

```typescript
export class Game extends  Model<GameAttributes, GameCreationAttributes> {
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare isEnabled: boolean;
  // …
}
```

You're all set! Make sure everything works locally before pushing or merging.

#### **🚫`backup.sql` file**

**Never** ever ever modify it. **Not even once**.

#### 👴🏻**Past migrations**

**Never ever modify any past migrations.** If a migration was created and deployed, you can't ever change it. If you need to modify it, just create a new migration which will run after the previous one.

### **🔒Environmental Variables**
The API needs some env vars to work properly. You can ask @ccmoralesj for this.

Just grab the `.env.example` file and copy everything into a new file called `.env.dev`. It will look something like this at first.
```
# API
HOST=0.0.0.0
#HOST=127.0.0.1
PORT=3000

# DATABASE
DB_USERNAME=
DB_PASSWORD=
DB_NAME=gameshq_api
DB_HOSTNAME=127.0.0.1
DB_PORT=5434

# THE ARENA APP DEV
SLACK_ARENA_TOKEN=
SLACK_ARENA_SIGNING_SECRET=
# Private Channel
SLACK_ARENA_XHQ_CHANNEL=

# THE TOWER APP
SLACK_TOWER_SIGNING_SECRET=
SLACK_TOWER_TOKEN=
SLACK_THE_TOWER_CHANNEL=

# CAMPAIGN APP
SLACK_CAMPAIGN_SIGNING_SECRET=
SLACK_CAMPAIGN_TOKEN=
SLACK_NEUTRAL_ZONE_CHANNEL=

# FRONT-END-APP
FRONT_END_APP_BOT_TOKEN=
FRONT_END_SIGNING_SECRET=

# COOKIE
COOKIE_PASSWORD=

# GOOGLE API CREDS 
GOOGLE_APPLICATION_CLIENT_ID=
GOOGLE_APPLICATION_CLIENT_SECRET=
GOOGLE_APPLICATION_CLIENT_RANDOM_PASSWORD=

# FIREBASE
GOOGLE_APPLICATION_CREDENTIALS=/some/path/to/google_credentials_games_api.json
```
### **🖥️API**
We are almost there with the setup.🥲 Now it's time to run the API

First, make sure you're using our recommended version of Node and yarn by running these commands:

```bash
nvm use
```

Following up, we have to install all required dependencies to run the project:

```bash
npm install
```

Finally, run the application in development mode with the following command:

```bash
npm run dev
# If you want to run "production" mode use npm start
```

The API should be up and running 🎉at port 3000!🎉 You can verify by browsing to [http://localhost:3000/documentation](http://localhost:3000/documentation)

Let's start coding!🤓

#### **API Documentation**
Documentation is auto-generated based on the Joi validation provided. You can access it at [`/documentation`](https://xhq-api.x-team.com/documentation).

## 🫂How to contribute
Collaborate in this repo is quite easy.
### 📊JIRA
You only need to pick up a ticket from the [JIRA board](https://x-team-internal.atlassian.net/jira/software/c/projects/XTG/boards/48) (If you don't have access you can ask @ccmoralesj)

Each JIRA ticket has an identifier based on a code and a number like XTG-123 which you will use later.
### 💾Commits
Each commit you do needs to have the JIRA ticket identifier so it can be related to the board.

You can use this commit format suggestion.

```
:optional-emoji: XTG-123: New endpoint to handle login
```

| **Emoji** | **Description**                         |
|-----------|-----------------------------------------|
| **🚀**    | New features, or enhancements to code   |
| **🐞**    | Bug fixes                               |
| **⚙️**    | Refactors                               |
| **📦**    | Build files, dependencies, config files |
| **🔎**    | Minor fixes, typos, imports, etc        |
| **🪄**    | Others                                  |


### 🕵🏻Pull Requests
Once you're ready. You can create a new Pull Request (PR) by adding the JIRA ticket identifier in the title. The repo will give you a template to fill in the details of your amazing work!

You can use this PR title format suggestion.

```
XTG-123: Login
```

You'll need at least 1 review from your teammates to merge the pull request.

## 🪄Continous Integration
This project is connected to an EC2 instance from AWS.

All code from `main` branch will be deployed to staging.

To **deploy to production** you must create a `new release` and follow the [semantic versioning](https://semver.org/lang/es/) fundamentals. That will trigger an automated deployment to **production**.

## 🪄Documentation
Some further information can be found on the X-team GamesHQ API [Confluence page](https://x-team-internal.atlassian.net/wiki/spaces/XTG/pages/2300706828/GamesHQ+API)
