scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
rm -rf  $scriptDir/../bigbluebutton-web/lib/bbb-common-web*
sbt clean publish publishLocal
