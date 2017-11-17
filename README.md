# Barfer [![Build Status](https://travis-ci.org/mizrael/barfer.svg?branch=master)](https://travis-ci.org/mizrael/barfer)
Barfer is a Twitter clone, plain and simple. I started this project just for fun and for learning purpose: I was looking for a way to improve my NodeJS skills and to learn how to use RabbitMQ.

I have used NodeJS with Typescript to write all the projects, with a CQRS + Publish/Subscribe + Multiservices architecture to display barfs (tweets), user details and the necessary interactions.

There are some external services I have used to speedup the development and to obtain certain features:
* Mongodb hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* RabbitMQ hosted on [Cloudamqp](https://www.cloudamqp.com) to handle events and messages
* [Auth0](https://auth0.com/) to handle authentication.
* [Travis CI](https://travis-ci.org) to handle the deployment.
* [Azure](https://azure.microsoft.com/en-us/) as hosting platform.

**I am perfectly aware** that the repository contains the connection strings. As said, this is a project written just for learning, I don't care much about the security, not at this stage.

All the services have been deployed on Azure, the web client can be found here: [https://barfer.azurewebsites.net/](https://barfer.azurewebsites.net/) .

### Build & Run
You can easily build the projects using the Gulp task `build:dev` which will also watch for changes. The `default` task is intented to be used for deployment only.

A launch configuration for Visual Studio Code is provided to run all the projects, named `All services`.

### Tests
The unit and integration tests can be run using the standard `npm run test` command from the terminal. If you want to run just the unit tests, use `npm run unit`. For the integration tests instead, use `npm run integration`.

### Roadmap
There's a bunch of features that I'm planning to add, more or less in this order:
* hashtags
* user interests
* barf tags
* search engine
* comments
* notifications