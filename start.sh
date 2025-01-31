#!/bin/bash

docker-compose -f ./todo-api/docker-compose.yaml up -d
docker-compose -f ./todo-ui/docker-compose.yaml up -d
