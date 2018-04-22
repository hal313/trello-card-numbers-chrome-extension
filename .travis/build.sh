#!/bin/bash

## Publishes the extension to the Chrome Web Store if on the master branch
if [[ 'master' == $TRAVIS_BRANCH ]]; then
  echo "Publishing on branch: $TRAVIS_BRANCH"
  grunt publish --clientId=$CLIENT_ID --clientSecret=$CLIENT_SECRET --refreshToken=$REFRESH_TOKEN
else
  echo "Building on branch: $TRAVIS_BRANCH"
  grunt build
fi