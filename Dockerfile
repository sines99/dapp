FROM node:8.8.1

# setup user home dir
ENV USER node

# setup application dir
ENV APP_HOME /app
RUN mkdir -vp $APP_HOME
RUN chown $USER:$USER $APP_HOME

# run next commands as user deamon
USER $USER
ENV HOME /home/$USER
ENV PATH $PATH:$HOME/.meteor

# install meteor (for building distribution)
RUN curl -sL https://install.meteor.com | /bin/sh

# setup temp dir for building meteor distribution
USER root

#install required packages (magick)
RUN apt-get update
RUN apt-get install apt-utils netcat -y
RUN apt-get install imagemagick libmagick++-dev  libmagick++-6.q16-dev -y
ENV PATH /usr/lib/x86_64-linux-gnu/ImageMagick-6.8.9/bin-Q16:$PATH

WORKDIR $APP_HOME
COPY . $APP_HOME
RUN chown -R $USER:$USER $APP_HOME
USER $USER

# set NPM stuff
ENV NODE_ENV development
ENV NPM_CONFIG_LOGLEVEL warn

RUN meteor npm install
RUN meteor npm install --save bcrypt

# install NPM packages
WORKDIR $APP_HOME
CMD meteor run
#--settings settings.json
