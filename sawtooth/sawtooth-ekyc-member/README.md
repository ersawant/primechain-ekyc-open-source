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

2. The Transaction Processor is written in Java using sawtooth-sdk. The Transaction Processor is also available in C++ and Python.

**NOTE:**
The preferred OS environment is Ubuntu 16.04.3 LTS x64.
