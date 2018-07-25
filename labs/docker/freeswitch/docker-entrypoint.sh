#!/bin/bash -xe

IP=$(hostname -I | cut -d' ' -f1)

xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "external_rtp_ip=")]/@data' --value "stun:coturn" /opt/freeswitch/conf/vars.xml
xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "external_sip_ip=")]/@data' --value "stun:coturn" /opt/freeswitch/conf/vars.xml
xmlstarlet edit --inplace --update '//X-PRE-PROCESS[@cmd="set" and starts-with(@data, "local_ip_v4=")]/@data' --value "${IP}" /opt/freeswitch/conf/vars.xml
xmlstarlet edit --inplace --update '//param[@name="ws-binding"]/@value' --value ":7443" /opt/freeswitch/conf/sip_profiles/external.xml
xmlstarlet edit --inplace --update '//param[@name="ws-binding"]/@name' --value "wss-binding" /opt/freeswitch/conf/sip_profiles/external.xml

/opt/freeswitch/bin/freeswitch
