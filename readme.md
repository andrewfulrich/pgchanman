# pgchanman

Postgres db change management tool.

## Features

- extremely simple, just write your migration scripts and run the command
- dotenv compatible
- migration scripts are run in a transaction with auto-rollback on error

Note: this does not support going back to a previous db version. If you want to go to a previous version, you must write a new script to migrate the current version's state to a new version which looks the same as the old version. In other words, you can't rewrite history, which may be an advantage in some situations. 

Also note, it's up to you to put in place things like [guard clauses](https://www.red-gate.com/simple-talk/sql/database-administration/using-migration-scripts-in-database-deployments/) or other pre-condition/post-condition checks IF you desire more guarantees against unexpected effects. Different people find different balances of safety, speed, and complexity.

## How to use
First set up a "migrations" folder in your project root. Put your migration scripts into this folder. 

Number all your migration scripts with a "{#}_" prefix in the order you want them to run, for example "1_initial_ddl.sql" or "2_unique_foo_constraint.sql"

Then:

`npm install pgchanman`

`npx pgchanman` or put it into an npm script. For example I have an `npm run migrate` which runs `pgchanman && postgerd -o erd.svg`