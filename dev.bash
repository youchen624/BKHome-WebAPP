
# Build
npm run build
# npm start

# DEV | Main Test   <<<< ====
npm run db:up
npm run dev



# Production | After dev, move to product or update
# 1. get .sql change cmd (apps/api/drizzle/)
npm run db:generate
# 2. move (bring .sql)
# 3. update
drizzle-kit migrate # OR> drizzle-orm 's migrate() in server.ts

# TMP
docker compose -f docker-compose.dev.yml down
rmdir /s /q .database\postgres-dev
docker compose -f docker-compose.dev.yml up -d --wait
node --env-file=.env ./node_modules/drizzle-kit/bin.cjs migrate --config=apps/api/drizzle.config.js
