#!/bin/bash

#colors
RED='\033[0;31m'
GREEN='\033[1;32m'
NC='\033[0m'

if [ "$#" = 0 ]
then
  echo -e "${RED}ERR${NC}: Usage = ${GREEN}./transifex.sh pt_BR de  ${NC}or  ${GREEN}./transifex all${NC}"
else
  read -p "Enter Transifex Username: " USER
  read -p "password: " -s PW
  echo -e "\n----------------------------------\nchecking project info\n----------------------------------"
  PROJECT_INFO=$( curl -L --user "$USER":"$PW" -X GET https://www.transifex.com/api/2/project/bigbluebutton-html5/languages/ )

  if [ "$PROJECT_INFO" == "Authorization Required" ]
  then
    echo -e "${RED}Err${NC} : $PROJECT_INFO"
  else
    echo -e "Project Information Found :${GREEN} ✓${NC}"
    if [ "$PROJECT_INFO" == "Forbidden" ]
    then
      echo -e "${RED}Err${NC}: Invalid User Permissions"
    else
      for ARG in "$@"
      do
        if [ "$ARG" == "all"  ]
	then
	  AVAILABLE_TRANSLATIONS=$( echo "$PROJECT_INFO" | grep 'language_code' | cut -d':' -f2 | tr -d '[",]' )

          echo "$AVAILABLE_TRANSLATIONS" | while read l
	  do
	    LOCALE=$( echo "$l" | tr -d '[:space:]' )
	    TRANSLATION=$(curl -L --user "$USER":"$PW" -X GET "https://www.transifex.com/api/2/project/bigbluebutton-html5/resource/enjson/translation/$LOCALE/?mode=onlytranslated&file")
	    NO_EMPTY_STRINGS=$(echo "$TRANSLATION" | sed '/: *\"\"/D' | sed '/}$/D')
	    if [ $(echo "$NO_EMPTY_STRINGS" | wc -l) == 1 ]
	    then
	      echo -e "${RED}WARN:${NC} translation file $LOCALE.json is empty\n${RED}WARN:${NC} $LOCALE.json not created"
	      continue
	    else
	      NO_TRAILING_COMMA=$(echo "$NO_EMPTY_STRINGS" | sed  '$ s/,$//')
	      echo "$NO_TRAILING_COMMA" > ./private/locales/"$LOCALE".json
	      echo -e "\n}\n" >> ./private/locales/"$LOCALE".json
	      echo -e "Added translation file $LOCALE.json : ${GREEN}✓${NC}"
	    fi
	  done
	else
	  TRANSLATION=$(curl -L --user "$USER":"$PW" -X GET "https://www.transifex.com/api/2/project/bigbluebutton-html5/resource/enjson/translation/$ARG/?mode=onlytranslated&file")
	  if [ "$TRANSLATION" == "Not Found" ]
	  then
	    echo -e "${RED}Err${NC}: Translations not found for locale ->${RED}$ARG${NC}<-"
	  else
	    NO_EMPTY_STRINGS=$(echo "$TRANSLATION" | sed '/: *\"\"/D' | sed '/}$/D')
	    if [ $(echo "$NO_EMPTY_STRINGS" | wc -l) == 1 ]
	    then
	      echo -e "${RED}WARN:${NC} translation file $ARG.json is empty\n${RED}WARN:${NC} $ARG.json not created"
	    else
	      NO_TRAILING_COMMA=$(echo "$NO_EMPTY_STRINGS" | sed  '$ s/,//')
	      echo "$NO_TRAILING_COMMA" > ./private/locales/"$ARG".json
	      echo -e "\n}\n" >> ./private/locales/"$ARG".json
	      echo -e "Added translation file $ARG.json :${GREEN} ✓${NC}"
	    fi
	  fi
	fi
      done
    fi
  fi
fi
