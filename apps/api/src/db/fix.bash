# before do it, must remove "apps/api/drizzle/"
# re-generate
node --env-file=.env ./node_modules/drizzle-kit/bin.cjs generate --config=apps/api/drizzle.config.js

# migrate SQL -> build Database
npx tsx --env-file=.env -e "(async () => { const { drizzle } = await import('drizzle-orm/node-postgres'); const { migrate } = await import('drizzle-orm/node-postgres/migrator'); const { default: pg } = await import('pg'); const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); const db = drizzle(pool); await migrate(db, { migrationsFolder: './apps/api/drizzle' }); console.log('Done'); await pool.end(); })()"
