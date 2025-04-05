# packages installation stage

FROM node:23

WORKDIR /app 

COPY package*.json ./  

RUN npm install

COPY . .  

EXPOSE 9000 

CMD ["npm", "start"]