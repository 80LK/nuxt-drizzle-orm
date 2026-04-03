#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { loadNuxtConfig } from '@nuxt/kit'
import { parse as parseDotenv } from 'dotenv'
import { relative, resolve } from 'pathe'
import { spawn } from 'node:child_process'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

const DEFAULT_MIGRATIONS_DIR = 'migrations/drizzle'
const DEFAULT_SCHEMA_DIR = 'server/drizzle'

function loadEnvFiles(baseDir, initialEnvKeys) {
  const nodeEnv = process.env.NODE_ENV
  const filenames = [
    '.env',
    '.env.local',
    nodeEnv ? `.env.${nodeEnv}` : null,
    nodeEnv ? `.env.${nodeEnv}.local` : null
  ].filter(Boolean)

  for (const filename of filenames) {
    const filePath = resolve(baseDir, filename)

    if (!existsSync(filePath)) {
      continue
    }

    const parsed = parseDotenv(readFileSync(filePath))

    for (const [key, value] of Object.entries(parsed)) {
      if (initialEnvKeys.has(key)) {
        continue
      }

      process.env[key] = value
    }
  }
}

function printHelp() {
  console.log(`ndo <command> [options]

Commands:
  generate             Generate Drizzle SQL migrations
  migrate              Apply Drizzle migrations

Options:
  -c, --cwd <path>     Project directory with nuxt.config
  --custom             Generate an empty custom migration
  --breakpoints        Add Drizzle SQL breakpoints
  -h, --help           Show this help message`)
}

function parseArgs(argv) {
  const args = [...argv]
  const options = {
    cwd: process.cwd(),
    help: false,
    custom: false,
    breakpoints: false
  }

  let command

  while (args.length > 0) {
    const arg = args.shift()

    if (!arg) {
      continue
    }

    if (!command && !arg.startsWith('-')) {
      command = arg
      continue
    }

    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }

    if (arg === '--custom') {
      options.custom = true
      continue
    }

    if (arg === '--breakpoints') {
      options.breakpoints = true
      continue
    }

    if (arg === '-c' || arg === '--cwd') {
      const value = args.shift()

      if (!value) {
        throw new Error(`Missing value for ${arg}`)
      }

      options.cwd = resolve(value)
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return {
    command,
    options
  }
}

async function loadDrizzleOptions(cwd) {
  const initialEnvKeys = new Set(Object.keys(process.env))

  loadEnvFiles(cwd, initialEnvKeys)

  const nuxtConfig = await loadNuxtConfig({ cwd })
  const rootDir = resolve(nuxtConfig.rootDir || cwd)

  if (rootDir !== cwd) {
    loadEnvFiles(rootDir, initialEnvKeys)
  }

  const drizzleConfig = nuxtConfig.drizzle || {}
  const runtimeDrizzleConfig = nuxtConfig.runtimeConfig?.drizzle || {}

  const url = drizzleConfig.url
    || runtimeDrizzleConfig.url
    || process.env.NUXT_DRIZZLE_URL
    || process.env.DATABASE_URL

  return {
    rootDir,
    url,
    migrationsDir: resolve(rootDir, drizzleConfig.migrationsDir || DEFAULT_MIGRATIONS_DIR),
    schema: resolve(rootDir, drizzleConfig.schema || DEFAULT_SCHEMA_DIR)
  }
}

async function runMigrate(options) {
  const config = await loadDrizzleOptions(options.cwd)

  if (!config.url) {
    throw new Error(
      'Database URL is missing. Set drizzle.url in nuxt.config or provide DATABASE_URL/NUXT_DRIZZLE_URL.'
    )
  }

  console.log(`[ndo] rootDir: ${config.rootDir}`)
  console.log(`[ndo] schema: ${config.schema}`)
  console.log(`[ndo] migrations: ${config.migrationsDir}`)

  const pool = new Pool({
    connectionString: config.url
  })

  try {
    const db = drizzle(pool)
    await migrate(db, { migrationsFolder: config.migrationsDir })
    console.log('[ndo] Migrations applied successfully.')
  } finally {
    await pool.end()
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options
    })

    child.on('error', rejectPromise)
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }

      rejectPromise(new Error(`Command failed with exit code ${code}`))
    })
  })
}

function toCliPath(rootDir, targetPath) {
  const path = relative(rootDir, targetPath)

  return path || '.'
}

async function runGenerate(options) {
  const config = await loadDrizzleOptions(options.cwd)
  const schemaPath = toCliPath(config.rootDir, config.schema)
  const migrationsPath = toCliPath(config.rootDir, config.migrationsDir)
  const args = [
    resolve('node_modules/drizzle-kit/bin.cjs'),
    'generate',
    '--dialect',
    'postgresql',
    '--schema',
    schemaPath,
    '--out',
    migrationsPath
  ]

  if (options.custom) {
    args.push('--custom')
  }

  if (options.breakpoints) {
    args.push('--breakpoints')
  }

  console.log(`[ndo] rootDir: ${config.rootDir}`)
  console.log(`[ndo] schema: ${config.schema}`)
  console.log(`[ndo] migrations: ${config.migrationsDir}`)

  await runCommand(process.execPath, args, {
    cwd: config.rootDir
  })

  console.log('[ndo] Migration files generated successfully.')
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2))

  if (options.help || !command) {
    printHelp()
    return
  }

  if (command === 'migrate') {
    await runMigrate(options)
    return
  }

  if (command === 'generate') {
    await runGenerate(options)
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[ndo] ${message}`)
  process.exitCode = 1
})
