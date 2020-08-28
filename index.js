#!/usr/bin/env node
require('dotenv').config()
const { Client } = require('pg')
const fs=require('fs')

const config=process.env.DATABASE_URL ? {
  connectionString:process.env.DATABASE_URL
} : {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database:process.env.PGDATABASE
}

//You must use the same client instance for all statements within a transaction. https://node-postgres.com/features/transactions
const client=new Client(config)

async function execScript(script,scriptNumber,scriptName) {
  try {
    await client.query('BEGIN')
    var statements = script.split(/;\s*$/m);
    for(let i=0;i<statements.length;i++) {
      await client.query(statements[i])
    }
    await client.query({
      text:'INSERT INTO migrations (migration_num,migration_file) VALUES ($1,$2)',
      values:[scriptNumber,scriptName]
    })
    await client.query('COMMIT')
  } catch(e) {
    await client.query('ROLLBACK')
    throw e
  }
}

async function getCompletedMigrations() {
  const result = await client.query({ text: 'SELECT migration_num FROM migrations;' })
  return result.rows.map(r=>r.migration_num)
}

async function runMigrations() {
  try {
    await client.connect()
    await createMigrationTableIfNotExists(client)
    const completedMigrations=await getCompletedMigrations()
    console.log('Completed Migrations:',completedMigrations)
    
    const getMigrationNumber=fileName=>parseInt(fileName.split('_')[0])
    const alreadyCompleted=fileName=>!completedMigrations.includes(getMigrationNumber(fileName))
    const files= fs.readdirSync('./migrations')
      .filter(alreadyCompleted)
    files.sort((f1,f2)=>getMigrationNumber(f1)-getMigrationNumber(f2))

    for(let i=0;i<files.length;i++) {
      const file=files[i];
      const contents = fs.readFileSync(`./migrations/${file}`,'utf8');
      console.log(`--------------- executing ${file} ---------------`)
      await execScript(contents,getMigrationNumber(file),file)
      console.log(`--------------- successfully executed ${file} ---------------`)
    }
  } catch(e) {
   console.error(`${new Date().toISOString()} MIGRATION ERROR: ${e.stack}`)
  } finally {
    client.end()
    .then(() => console.log('client has disconnected'))
    .catch(err => console.log('error during disconnection', err.stack))
  }
}

async function createMigrationTableIfNotExists(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS migrations (
    migration_num INTEGER UNIQUE,
    migration_file TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );`)
}
runMigrations()
