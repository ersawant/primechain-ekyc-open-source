# sawtooth-eKYC Alpha 1
eKYC Application on sawtooth blockchain platform (processor + client)

# Introduction

This is a Alpha 1.0 version of a sawtooth eKYC application. It includes following features;

1. Uploading KYC document
2. Viewing "My Records" and downloading those uploaded documents.
3. Searching document with the CIN and downloading.

The user is identified by a user CIN and a corresponding public key. The kyc document, is stored at an address, derived from SHA 512 hash of customer's CIN public key and the transaction family namespace.

# Components
The application is built in two parts:
1. The client application written in Python, written in two parts: _client.py file representing the backend stuff and the _cli.py representing the frontend stuff. The example is built by using the setup.py file located in one directory level up.

2. The Transaction Processor is written in C++11 using c++-sawtooth-sdk. It comes with its CMake files for build. The Transaction Processor is also available in Java and Python.

**NOTE**

The client is also written in Javascript using node.js. The `app.js` is the main javascript file from where the `main` function call occurs. Handlebars are used for templating, client related CSS and JavaScript code is written in public folder and server related files are written in router/ folder. Running the default docker-compose.yaml file launches the client, which is accessible at `localhost:3000`.

# Pre-requisites

This example uses docker-compose and Docker containers. If you do not have these installed please follow the instructions here: https://docs.docker.com/install/

**NOTE:**
The preferred OS environment is Ubuntu 16.04.3 LTS x64. Although, other linux distributions which support Docker should work. 
If you have Windows please install [Docker Toolbox for Windows](https://docs.docker.com/toolbox/toolbox_install_windows/) or [Docker for Windows](https://docs.docker.com/docker-for-windows/), based on your OS version.

**NOTE:**
The minimum version of Docker Engine necessary is 17.03.0-ce. Linux distributions often ship with older versions of Docker.

[Here's a gist](https://gist.github.com/askmish/76e348e34d93fc22926d7d9379a0fd08) detailing steps on installing docker and docker-compose.

# Usage

Start the pre-built Docker containers in docker-compose.yaml file, located in sawtooth-simplewallet directory:
```bash
cd sawtooth-simplewallet
docker-compose up
```
At this point all the containers should be running.

To launch the client, you could do this:
```bash
docker exec -it simplewallet-client bash
```
You can locate the right Docker client container name using `docker ps`.

# Building containers
To build TP code of your preferred language and run the simplewallet example:

```bash
docker-compose -f simplewallet-build-tp-<your_prog_language>.yaml up --build
```
where,
 <your_prog_language> should be replaced with either `cxx`, `java`, or `py`
