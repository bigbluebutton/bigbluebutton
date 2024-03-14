#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm install
fi

npm run build
echo ''
echo ''
echo '----------------'
echo 'bbb-graphql-client updated'
