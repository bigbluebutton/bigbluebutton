#!/bin/bash

AUTH=$(<~/.transifexrc)
PW=$(echo "$AUTH" | grep 'password' | cut -d'=' -f2 | tr -d '[:space:]')
USER=$(echo "$AUTH" | grep 'username' | cut -d'=' -f2 | tr -d '[:space:]')

for ARG in "$@"
do
	if [ "$ARG" == "all"  ]
	then
		PROJECT_INFO=$( curl -L --user "$USER":"$PW" -X GET https://www.transifex.com/api/2/project/bigbluebutton-html5/languages/ )
     		AVAILABLE_TRANSLATIONS=$( echo "$PROJECT_INFO" | grep 'language_code' | cut -d':' -f2 | tr -d '[",]' )

		echo "$AVAILABLE_TRANSLATIONS" | while read l
		do
        		LOCALE=$( echo "$l" | tr -d '[:space:]' )
        		TRANSLATION=$(curl -L --user "$USER":"$PW" -X GET "https://www.transifex.com/api/2/project/bigbluebutton-html5/resource/enjson/translation/$LOCALE/?mode=onlytranslated&file")
			echo "$TRANSLATION" | sed '/: ""/D' > ./private/locales/"$LOCALE".json
		done
	else
		TRANSLATION=$(curl -L --user "$USER":"$PW" -X GET "https://www.transifex.com/api/2/project/bigbluebutton-html5/resource/enjson/translation/$ARG/?mode=onlytranslated&file")
	
		if [ "$TRANSLATION" == "Not Found" ]
		then
			echo "ERR: Translations not found for locale -> $ARG <-"
		else
			echo "$TRANSLATION" | sed '/: ""/D' > ./private/locales/"$ARG".json
		fi

	fi
done
