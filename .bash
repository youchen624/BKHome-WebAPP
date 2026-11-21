npm init -y

npm install -D typescript @types/node

npx tsc --init

# mkdir "apps/api/src" "apps/web/src" "packages/core/src"
mkdir "apps\api\src" "apps\web\src" "packages\core\src"
npm init -y -w "apps\api"
npm init -y -w "apps\web"
npm init -y -w "packages\core"
# npm install @bkhome/core -w apps/api
# npm install @bkhome/core -w apps/web


# Lib

npm install zod -w packages/core
npm install -D tsx

npm install react react-dom -w apps/web
# Vite & TypeScript type-support
npm install -D vite @vitejs/plugin-react @types/react @types/react-dom -w apps/web

npm install express cors -w apps/api
npm install -D @types/express @types/cors -w apps/api
npm install pg argon2 cookie-parser -w apps/api
npm install -D @types/pg @types/cookie-parser -w apps/api

npm install react-router -w apps/web
