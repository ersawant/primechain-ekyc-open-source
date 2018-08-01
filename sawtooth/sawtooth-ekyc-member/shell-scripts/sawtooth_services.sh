#!/bin/bash

sudo systemctl start sawtooth-validator.service
sudo systemctl start sawtooth-settings-tp.service
sudo systemctl start sawtooth-rest-api.service
sudo systemctl start sawtooth-java-tp.service

