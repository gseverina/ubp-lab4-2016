FROM alpine:latest
MAINTAINER Gaston Severina <gseverina@gmail.com>

# Install python and pip
RUN apk add --update py-pip

# upgrade pip
RUN pip install --upgrade pip

# install ansible
RUN apk add ansible

# adding playbooks
ADD ./playbooks /usr/playbooks
WORKDIR /usr/playbooks

