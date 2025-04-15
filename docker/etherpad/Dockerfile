FROM etherpad/etherpad:2.3

USER root

RUN apk add git curl

USER etherpad

RUN pnpm run plugins i \
    ep_disable_chat@0.0.10 \
    ep_auth_session@1.1.1 \
    --github \
        mconf/ep_cursortrace#56fb8c2b211cdda4fc8715ec99e1cb7b7d9eb851 \
        mconf/ep_pad_ttl#360136cd38493dd698435631f2373cbb7089082d \
        mconf/ep_redis_publisher#2b6e47c1c59362916a0b2961a29b259f2977b694

# download and add skin from git repo
RUN git clone https://github.com/alangecker/bbb-etherpad-skin.git /tmp/bbb-etherpad-skin && \
    mkdir -p /opt/etherpad-lite/src/static/skins/bigbluebutton && \
    cp -r /tmp/bbb-etherpad-skin/* /opt/etherpad-lite/src/static/skins/bigbluebutton && \
    rm -rf /tmp/bbb-etherpad-skin

# download and add bbb plugin from git repo
RUN git clone https://github.com/alangecker/bbb-etherpad-plugin.git /tmp/bbb-etherpad-plugin && \
    mkdir -p /opt/etherpad-lite/bbb-etherpad-plugin && \
    cp -r /tmp/bbb-etherpad-plugin/* /opt/etherpad-lite/bbb-etherpad-plugin && \
    rm -rf /tmp/bbb-etherpad-plugin
RUN pnpm run plugins i --path /opt/etherpad-lite/bbb-etherpad-plugin

COPY settings.json /opt/etherpad-lite/settings.json
COPY etherpad-export.sh /etherpad-export.sh
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
