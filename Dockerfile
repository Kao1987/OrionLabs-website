# 建構階段
FROM node:22-alpine AS build

WORKDIR /app

# 複製 package 文件
COPY package.json yarn.lock ./

# 安裝依賴
RUN yarn install --frozen-lockfile

# 複製原始碼
COPY . .

# 建構應用
RUN yarn build

# 生產階段
FROM nginx:alpine AS production

# 安裝 curl 用於健康檢查
RUN apk --no-cache add curl

# 複製建構產物到 nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"] 