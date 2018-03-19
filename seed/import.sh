#!/usr/bin/env bash

# run it like this:
# docker-compose up
# docker exec database.mysql bash /tmp/import.sh

mysql -u root cities < /tmp/mysqldump.sql