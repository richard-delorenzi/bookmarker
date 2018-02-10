FROM node:9.5-stretch

RUN git clone git://github.com/uikit/uikit.git
RUN cd uikit && npm install

# set up user and permission
RUN export uid=1000 gid=1000 && \
    mkdir -p /home/developer && \
    echo "developer:x:${uid}:${gid}:Developer,,,:/home/developer:/bin/bash" >> /etc/passwd && \
    echo "developer:x:${uid}:" >> /etc/group && \
    chown ${uid}:${gid} -R /home/developer && \
    chown ${uid}:${gid} -R /uikit
    #echo "developer ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/developer && \
    #chmod 0440 /etc/sudoers.d/developer

USER developer
ENV HOME /home/developer
WORKDIR $HOME

RUN cd /uikit && \
    npm run compile

LABEL name="UiKit" \
      version="" \
      description="a tool making websites: css, and some js"
