FROM node:latest

# 앱 디렉토리 생성
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 
COPY . .

EXPOSE 8000

# 앱을 실행합니다.
CMD ["npm", "start"]