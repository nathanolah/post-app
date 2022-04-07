#!/bin/bash

echo What is the new version of this deployment? Example: 1.0.1
read VERSION

docker build -t nolah/postapp:$VERSION .
docker push nolah/postapp:$VERSION

# ssh into server and runs further commands in double quotes.
ssh root@159.89.239.26 "docker pull nolah/postapp:$VERSION && docker tag nolah/postapp:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"

