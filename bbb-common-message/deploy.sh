scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
rm -rf $scriptDir/../bbb-common-web/lib_managed/jars/org.bigbluebutton/bbb-common-message_2.12
rm -rf $scriptDir/../akka-bbb-apps/lib_managed/jars/org.bigbluebutton/bbb-common-message_2.12
rm -rf $scriptDir/../bigbluebutton-web/lib/bbb-*
sbt clean publish publishLocal
