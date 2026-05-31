#!/usr/bin/env bash

npm install

apt-get update && apt-get install -y ffmpeg python3 python3-pip

pip3 install yt-dlp