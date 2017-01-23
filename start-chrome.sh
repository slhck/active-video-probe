#!/bin/bash
# Chrome helper file.
# Comment out the configuration lines for your OS.

port=9222
#proxy="http://212.201.109.4:8080"

# Linux:
# google-chrome-stable --remote-debugging-port="$port" --disable-application-cache --disable-cache --disk-cache-size=1 --proxy-server="$proxy"

# OS X / macOS
sudo /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port="$port" --disable-application-cache --disable-cache --disk-cache-size=1
