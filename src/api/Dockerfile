FROM oraclelinux:7-slim

ENV TZ="America/Whitehorse"

RUN yum upgrade -y && yum install yum-utils
RUN  yum -y install oracle-release-el7 && \
     yum-config-manager --enable ol7_oracle_instantclient && \
     yum -y install oracle-instantclient19.3-basiclite && \
     rm -rf /var/cache/yum

RUN yum-config-manager --enable *addons
RUN yum install -y gcc-c++ make libaio

RUN curl -sL https://rpm.nodesource.com/setup_13.x | bash -
RUN yum install -y nodejs
RUN npm install -g pm2@latest
RUN npm install -g html-pdf

RUN yum -y install iputils

RUN export LD_LIBRARY_PATH=/usr/lib/oracle/19.3/client64/lib


WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
RUN npm install

RUN npm install -g nodemon
COPY ./ ./
EXPOSE 3000 6379

CMD ["npm run start"]