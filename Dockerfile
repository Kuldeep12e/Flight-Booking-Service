FROM node:18

WORKDIR /developer

RUN apt-get update && apt-get install -y git

RUN git clone https://github.com/Kuldeep12e/Flight-Booking-Service.git

WORKDIR /developer/Flight-Booking-Service

RUN npm ci

ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "dev"]
