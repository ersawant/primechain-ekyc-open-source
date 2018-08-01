#!/bin/bash

#To add the stable repository, run these commands in a terminal window on your host system:
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8AA7AF1F1091A5FD

sudo add-apt-repository 'deb http://repo.sawtooth.me/ubuntu/1.0/stable xenial universe'

sudo apt-get update

#Sawtooth consists of several Ubuntu packages that can be installed together using the sawtooth metapackage. Run the 		     following command in the same host terminal window:
sudo apt-get install -y sawtooth


