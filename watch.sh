#!/bin/bash

docker-compose -f ./todo-api/docker-compose.yaml watch &
docker-compose -f ./todo-ui/docker-compose.yaml watch &
wait