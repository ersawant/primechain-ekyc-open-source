#!/bin/bash

echo "deb http://repo.sawtooth.me/ubuntu/ci xenial universe" >> /etc/apt/sources.list \
 && echo "deb http://repo.sawtooth.me/ubuntu/1.0/stable xenial universe" >> /etc/apt/sources.list 
 
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8AA7AF1F1091A5FD
 
sudo apt-get update \
 && apt-get install -y -q --no-install-recommends \
    apt-utils \
 && apt-get install -y -q \
    apt-transport-https \
    build-essential \
    ca-certificates \
    inetutils-ping \
    libffi-dev \
    libssl-dev \
    python3-aiodns=1.1.1-1 \
    python3-aiohttp>=2.3.2-1 \
    python3-aiopg \
    python3-async-timeout=1.2.0-1 \
    python3-bitcoin=1.1.42-1 \
    python3-cbor \
    python3-cchardet=2.0a3-1 \
    python3-chardet=2.3.0-1 \
    python3-colorlog \
    python3-cov-core \
    python3-cryptography-vectors=1.7.2-1 \
    python3-cryptography=1.7.2-1 \
    python3-dev \
    python3-grpcio-tools=1.1.3-1 \
    python3-grpcio=1.1.3-1 \
    python3-lmdb=0.92-1 \
    python3-multidict=2.1.4-1 \
    python3-netifaces=0.10.4-0.1build2 \
    python3-nose2 \
    python3-pip \
    python3-protobuf \
    python3-psycopg2 \
    python3-pycares=2.1.1-1 \
    python3-pyformance \
    python3-pytest-runner=2.6.2-1 \
    python3-pytest=2.9.0-1 \
    python3-pytz=2016.10-1 \
    python3-requests \
    python3-secp256k1=0.13.2-1 \
    python3-setuptools-scm=1.15.0-1 \
    python3-six=1.10.0-1 \
    python3-toml \
    python3-yaml \
    python3-yarl=0.10.0-1 \
    python3-zmq \
    software-properties-common \
    python3-sawtooth-sdk \
    python3-sawtooth-cli \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
