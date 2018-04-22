# [Trello Card Numbers Chrome Extension](https://github.com/hal313/trello-card-numbers-chrome-extension)

[![Build Status](http://img.shields.io/travis/hal313/trello-card-numbers-chrome-extension/master.svg?style=flat-square)](https://travis-ci.org/hal313/trello-card-numbers-chrome-extension)
[![Dependency Status](https://david-dm.org/hal313/trello-card-numbers-chrome-extension.svg?style=flat-square)](https://david-dm.org/hal313/trello-card-numbers-chrome-extension)[![DevDependency Status](https://david-dm.org/hal313/trello-card-numbers-chrome-extension/dev-status.svg?style=flat-square)](https://david-dm.org/hal313/trello-card-numbers-chrome-extension)


> Chrome extension to display card numbers on Trello cards.

# Introduction
Trello does not place numbers on cards; this extension unhides the card numbers.


## Setup
Initial setup for any development environment.
```
npm install -g grunt-cli
npm install
```
## Build
A build will generate usable artifacts in the `dist/`. 
```
npm run build
```
or
```
grunt build
```


## Run Locally
Running locally will constantly perform a `build` when any deployable assets change (images, CSS, JS or HTML files). This functionality works well when local extensions are installed ([Install Local Extensions](https://developer.chrome.com/extensions/getstarted#manifest)). There is no need to reload the extension every time a file is changed (for Browser Actions).
```
npm start
```
or
```
grunt debug
```

## Build For Release
Clean the workspace, perform a build, bump the manifest version and create an archive suitable for uploading to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

Note that if the build fails, it is possible that `jshint` failed; check the output contents for any violations.

```
npm run release
```
or
```
grunt release
```

## Publish A Release
A release will be published to the Chrome Web Store. Publishing for release requires some addional steps, required to enable the Chrome Store API and obtain API keys. [This](https://developer.chrome.com/webstore/using_webstore_api#beforeyoubegin) is a good primer and should provide all the information needed. You will end up with three pieces of information:
- clientId
- clientSecret
- refreshToken

The grunt task expects these as options passed into the CLI (see the example below). The npm script `npm publish` expects three environment variables:
- CLIENT_ID
- CLIENT_SECRET
- REFRESH_TOKEN

The npm script is useful for CD situations; most CD servers allow for environment variable substitution which allows the npm task to function correctly while also not requiring sensitive information to be commited to git.
```
npm run publish
```
or
```
grunt publish --clientId=CLIENT_ID --clientSecret=CLIENT_SECRET --refreshToken=REFRESH_TOKEN
```

It may be useful to disable actual publishing to the Chrome Web Store, particularly when testing CI or CD systems. In order to simulate a succesful or failed publish, one of the following options may be passed to the `grunt publish` command:
* `--fake-publish` This will simulate a successful publish
* `--fake-publish-fail` This option will simulate a failed publish

The option `--fake-publish-fail` will take precedence if both options are supplied on the command line.

## Publish Procedure
The preferred way to publish a new version is to prepare the build locally, push changes to `master` and let [TravisCI](https://travis-ci.org/hal313/trello-card-numbers-chrome-extension/) build the extensions and publish to the Chrome Web Store. This promotes consistent and reproducable builds.

In general, the steps (manual or automated) are:
* Create a release branch
* Bump the version
* Build a deployable
   * If using CI/CD, create a build (`grunt build`) in order to verify that the build succeeds
   * If manually publishing, run `grunt publish`
* Commit the version bump
* Merge the release branch into `master`
* Create a tag
* Merge the release branch into `develop`
* Push branches and tags
   * If using CI/CD, the push to `master` will generally trigger a build on the server

This script is suitable for locally preparing a build and push changes to
a CI/CD server for publishing to the Chrome Web Store.

```bash
## Set the version to the *next* build; the *next* build is typically an
## increment of the patch version found in package.json, but the source of
## truth for the build will be the current published version in the Chrome
## Web Store:
## https://chrome.google.com/webstore/detail/trello-card-numbers/ijnbgfbpkcnohomlcomegpocpkneblep
##
export VERSION=x.y.z && \
echo Create a release branch && \
git checkout -b release/$VERSION && \
echo Version bump && \
grunt version-bump &&
echo Commit the version bump && \
git commit -a -m "Version bump" && \
echo Build a release && \
grunt release && \
echo Checkout the "master" branch && \
git checkout master && \
echo Merge the release branch into the "master" branch && \
git merge --no-ff release/$VERSION && \
echo Tag the release && \
git tag -a -m "Tagged for release" $VERSION && \
echo Checkout the "develop" branch && \
git checkout develop && \
echo Merge the release branch into the "develop" branch && \
git merge --no-ff release/$VERSION && \
echo Delete the release branch && \
git branch -d release/$VERSION && \
echo Push the branches and tags && \
git push origin --all && \
git push origin --tags
```

## Licence
This software is released under the [MIT Licence](https://raw.githubusercontent.com/hal313/trello-card-numbers-chrome-extension/master/LICENSE).


## Table Of Contents
- [Trello Card Numbers Chrome Extension](#trello-card-numbers-chrome-extension)
- [Introduction](#introduction)
  - [Setup](#setup)
  - [Build](#build)
  - [Run Locally](#run-locally)
  - [Build For Release](#build-for-release)
  - [Publish A Release](#publish-a-release)
  - [Publish Procedure](#publish-procedure)
  - [Licence](#licence)
  - [Table Of Contents](#table-of-contents)