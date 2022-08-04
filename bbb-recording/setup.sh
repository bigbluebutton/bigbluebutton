#!/bin/bash
echo "***** Welcome to the BBB Recording setup *****"
echo -n "Have you edited the .env file? (1-Yes 2-No) "
read EDIT

case $EDIT in
  1)
    ;;
  2)
   echo "Please edit the .env file if you wish to customize your setup."
   ;;
  *)
    echo "That is not a valid option. Exiting."
    exit 0
    ;;    
esac

CONTINUE=1

evaluate_response () {
  case $1 in
    1)
      bash $HOME/src/bbb-recording/hibernate-cfg.sh
      ;;
    2)
      bash $HOME/src/bbb-recording/spring-cfg.sh
      ;;
    3)
      run_docker
      ;;
    4)
      docker stop postgres 
      ;;     
    5)
      bash $HOME/src/bbb-recording/docker-clean.sh
      ;;  
    6)
      CONTINUE=0
      ;;  
    *)
      echo "Your response is not recognized"
      ;;
  esac
}

run_docker() {
  cd bbb-recording-persistence
  docker compose --env-file ../.env up -d
  #while true; do sleep 1000; done
}


echo "1. Generate Hibernate configuration"
echo "2. Generate Spring configuration"
echo "3. Run Postgres Docker container"
echo "4. Stop Postgres Docker container"
echo "5. Remove Postgres Docker container"
echo "6. Exit"

while [ $CONTINUE -eq 1 ]
do
  echo -n "What would you like to do? "
  read RESPONSE	
  evaluate_response "$RESPONSE"
done

