FROM ubuntu
WORKDIR /user/app/bolt-stream
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update ; apt-get install -y ffmpeg
RUN apt-get install -y nodejs npm
COPY ./package*.json ./ 
RUN npm i
COPY . .
EXPOSE 3000
CMD [ "npm","start" ]