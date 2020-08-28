# YAMigrate

Yet another postgres db migration tool.

## Features

- extremely simple
- dotenv compatible
- migration scripts are run in a transaction with auto-rollback on error

## How to use
First set up a "migrations" folder in your project root. Put your migration scripts into this folder. 

Number all your migration scripts with a "{#}_" prefix, for example "1_initial_ddl.sql" or "2_unique_foo_constraint.sql"

Then:

`npm install yamigrate`
`npx yamigrate`