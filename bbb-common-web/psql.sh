#!/bin/bash
echo "==================     Help for psql   ========================="
echo "\\dt		: Describe the current database"
echo "\\t [table]	: Describe a table"
echo "\\c		: Connect to a database"
echo "\\h		: help with SQL commands"
echo "\\?		: help with psql commands"
echo "\\q		: quit"
echo "=================================================================="
docker exec -it postgres psql -U dev -d bbb
