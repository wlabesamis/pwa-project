# General advice:
#
# Installing software such as using `apt-get` will store temporary and cached
# data. This bloats the Docker image and should be avoided at all costs. Please
# ensure that for every instruction in this file you clean up within the same
# command. E.g. for `apt-get`, simply add `&& apt-get clean` at the very end.
#
# Documentation on the Dockerfile syntax is available here:
# https://docs.docker.com/reference/builder/
FROM mobify/ubuntu:16.04
MAINTAINER Mobify <ops@mobify.com>

ENV NPM_CONFIG_LOGLEVEL info
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 8.9.4

#   -> Install additional packages:
RUN apt-get update && apt-get install -yf apt-utils \
                                          netcat nano \
                                          libnss3-tools \
                                          xvnc4viewer vnc4server \
                                          xvnc4viewer \
                                          curl wget unzip git \
                                          unzip xvfb bzip2 && \
    apt-get update --fix-missing && apt-get -yf upgrade

# install java 8
#
RUN if grep -q Debian /etc/os-release && grep -q jessie /etc/os-release; then \
    echo "deb http://http.us.debian.org/debian/ jessie-backports main" | sudo tee -a /etc/apt/sources.list \
    && echo "deb-src http://http.us.debian.org/debian/ jessie-backports main" | sudo tee -a /etc/apt/sources.list \
    && sudo apt-get update; sudo apt-get install -yf -t jessie-backports openjdk-8-jre openjdk-8-jre-headless openjdk-8-jdk openjdk-8-jdk-headless \
  ; else \
    sudo apt-get update; sudo apt-get install -yf openjdk-8-jre openjdk-8-jre-headless openjdk-8-jdk openjdk-8-jdk-headless \
  ; fi

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# install nvm
# https://github.com/creationix/nvm#install-script
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v

# install chrome
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
      && (sudo dpkg -i /tmp/google-chrome-stable_current_amd64.deb || sudo apt-get -fy install)  \
      && rm -rf /tmp/google-chrome-stable_current_amd64.deb \
      && sudo sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
           "/opt/google/chrome/google-chrome" \
      && google-chrome --version

# install chrome 41 to emulate Googlebot
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/chrome-linux.zip "https://s3.amazonaws.com/downloads.mobify.com/qa/Linux_x64-chrome-linux-41.zip" \
      && cd /tmp \
      && unzip chrome-linux.zip \
      && rm -rf chrome-linux.zip \
      && mv chrome-linux chrome41 \
      && sudo mv chrome41 /usr/local/bin/chrome41

# install chromedriver 2.14 for chrome 41 support
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/chromedriver_linux64.zip "https://s3.amazonaws.com/downloads.mobify.com/qa/chromedriver_linux64-2.14.zip" \
      && cd /tmp \
      && unzip chromedriver_linux64.zip \
      && rm -rf chromedriver_linux64.zip \
      && mv chromedriver chromedriver2.14 \
      && sudo mv chromedriver2.14 /usr/local/bin/chromedriver2.14 \
      && sudo chmod +x /usr/local/bin/chromedriver2.14

# start xvfb automatically to avoid needing to express in circle.yml
ENV DISPLAY :99
RUN printf '#!/bin/sh\nXvfb :99 -screen 0 1280x1024x24 &\nexec "$@"\n' > /tmp/entrypoint \
	&& chmod +x /tmp/entrypoint \
        && sudo mv /tmp/entrypoint /docker-entrypoint.sh
