#!/bin/bash

FILE_VERSION=$(head -1 ~/dev/bigbluebutton/bigbluebutton-config/bigbluebutton-release)
OLD_VERSION=$(echo "$FILE_VERSION" | awk -F'=' '{print $2}')
NEW_VERSION="$1"

echo "Bumping BigBlueButton version"
echo "from << $OLD_VERSION"
echo "to >>>> $NEW_VERSION"

cd ..

sed -i "s/${OLD_VERSION}/${NEW_VERSION}/g" bigbluebutton-config/bigbluebutton-release bigbluebutton-web/grails-app/controllers/org/bigbluebutton/web/controllers/ApiController.groovy bigbluebutton-web/application.properties  bigbluebutton-client/resources/prod/lib/bbb_deskshare.js bigbluebutton-web/grails-app/conf/bigbluebutton.properties record-and-playback/matterhorn/webapp/bigbluebutton.yml record-and-playback/core/scripts/bigbluebutton.yml bbb-api-demo/build.gradle bbb-common-message/build.gradle bbb-video/build.gradle bbb-voice/build.gradle bigbluebutton-apps/build.gradle deskshare/app/build.gradle deskshare/applet/build.gradle deskshare/build.gradle deskshare/common/build.gradle esl-client-bbb/build.gradle esl-client-bbb/org.freeswitch.esl.client/build.gradle bigbluebutton-client/build.xml deskshare/applet/build.xml bigbluebutton-client/resources/config.xml.template deskshare/applet/scripts/deskshare.bat deskshare/applet/scripts/deskshare.sh deskshare/applet/scripts/deskshare.vbs bbb-api-demo/pom.xml bigbluebutton-client/src/org/bigbluebutton/util/i18n/ResourceUtil.as deskshare/applet/src/main/java/org/bigbluebutton/deskshare/client/ScreenSharerRunner.java 

# Update locales recursively
# 60 Locales
LOCALES=('ar_SY' 'az_AZ' 'bg_BG' 'bn_BN' 'bn_IN' 'ca_ES' 'cs_CZ' 'cy_GB' 'da_DK' 'de_DE' 'el_GR' 'en_US' 'es_ES' 'es_LA' 'et_EE' 'eu_ES' 'eu_EU' 'fa_IR' 'ff_SN' 'fi_FI' 'fr_CA' 'fr_FR' 'he_IL' 'hr_HR' 'hu_HU' 'hy_AM' 'id_ID' 'it_IT' 'ja_JP' 'kk_KZ' 'km_KH' 'ko_KR' 'lt_LT' 'lv_LV' 'ml_IN' 'mn_MN' 'ms_MY' 'nb_NO' 'ne_NE' 'ne_NP' 'nl_NL' 'no_NO' 'pl_PL' 'pt_BR' 'pt_PT' 'ro_RO' 'ru_RU' 'si_LK' 'sk_SK' 'sl_SI' 'sl_SL' 'sr_RS' 'sr_SR' 'sv_SE' 'th_TH' 'tr_TR' 'uk_UA' 'vi_VN' 'zh_CN' 'zh_TW');

for i in "${LOCALES[@]}"
do
  sed -i "s/${OLD_VERSION}/${NEW_VERSION}/g" "bigbluebutton-client/locale/${i}/bbbResources.properties"
done

# Update release log link
OLD_CONCAT_VERSION=$(echo "${OLD_VERSION}" | sed -e 's/\.//g')
NEW_CONCAT_VERSION=$(echo "${NEW_VERSION}" | sed -e 's/\.//g')
sed -i "s/${OLD_CONCAT_VERSION}/${NEW_CONCAT_VERSION}/g" "bigbluebutton-web/grails-app/conf/bigbluebutton.properties"
