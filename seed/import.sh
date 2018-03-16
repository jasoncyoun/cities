#!/usr/bin/env bash

# run it like this:
# docker-compose up
# docker exec database.dev bash /tmp/import.sh

mysql -u root -p$MYSQL_ROOT_PASSWORD < /tmp/dbcreation.sql