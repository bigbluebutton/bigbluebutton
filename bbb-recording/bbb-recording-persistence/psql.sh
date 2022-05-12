#!/bin/bash
. ../.env
echo "==================     Help for psql   ========================="
echo "\\dt		: Describe the current database"
echo "\\d [table]	: Describe a table"
echo "\\c		: Connect to a database"
echo "\\h		: help with SQL commands"
echo "\\?		: help with psql commands"
echo "\\q		: quit"
echo "Reset the database using the truncate_tables('$POSTGRES_USER') function"
echo "=================================================================="
docker exec -it postgres psql -U $POSTGRES_USER -d bbb
