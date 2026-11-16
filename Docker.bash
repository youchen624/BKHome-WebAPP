# Stage 1 | Dev ENV
# 1. Build for image
docker build --platform linux/amd64 -t bkhome:latest .
# amd64 arm64

# 2. pack it as .tar
docker save -o bkhome.tar bkhome:latest



# State 2 | Server Side
# 3. After bkhome.tar & docker-compose.yml prepared, run server with:
docker load -i bkhome.tar
docker compose up -d

# State 2.update | Server Side
# 4. re-load
docker load -i bkhome.tar
# 5. rebuild Container
docker compose up -d --force-recreate bkhome-app
# docker compose up -d
# 6. clean old Image files (for disk)
docker image prune -f
# Option
rm -f bkhome.tar
