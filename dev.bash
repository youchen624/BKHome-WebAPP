
# Build
npm run build
# npm start

# DEV | Main Test   <<<< ====
npm run db:up
npm run dev

# Database
# DEV | Database update (hard-forced immediately) will NOT generate any .sql
npm run db:push
# DEV | Database test
docker compose -f docker-compose.dev.yml down
rmdir /s /q .database\postgres-dev
docker compose -f docker-compose.dev.yml up -d --wait
npm run db:migrate
# check version update correct; for an Official Version .sql update file
# PROD | Database update
docker build -t bkhome:latest .   # rebuild image (includes "apps/api/drizzle/")
docker compose up -d




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
