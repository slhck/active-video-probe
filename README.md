# Active Video Probe for Google Chrome

Author: Werner Robitza

An Active Video Probe demo for Google Chrome. It runs HTML5 and YouTube video for demo purposes. The script connects to the Chrome browser via remote debugging protocol (using WebSockets) and logs the video events to the console, as indicated by the player API.

Any HTML5 video can be played as long as the browser supports the codec. YouTube uses the YouTube iFrame API, so it's automatically compatible.

This is just a demo, quickly thrown together. It may be enhanced by adding new playback technologies such as Vimeo, MPEG-DASH, or HLS.

# Requirements

- Google Chrome
- OS X or Linux
- Ruby 2.3.0

# Running

First, install Ruby (using rbenv is preferred).

Install the Bundler gem with `gem install bundler`.

Head to the project folder and run `bundle install`.

Now look at the `start-chrome.sh` file and comment out the line for your operating system.

Run `start-chrome.sh` and check if Chrome is running. If it's the first time, you may need to click away the login and "Getting Started" pages. There should only be an empty tab.

Then run `active-probe.rb`.

See the options with `active-probe.rb --help`.

# Events

The following events are logged:

- `pageLoaded`
- `documentReady`
- `playerReady`
- `playerStateChange`
- `playerQualityChange` (from YouTube API)
- `videoDuration`
- `finished`

The implementation can be changed to allow for more events to be captured, of course.

# Results

Results are printed to the console when a video finishes:

    PROBE RESULTS
    -----------------------------------------------------

    Player load time: 663 ms
    Startup delay:    783 ms
    Video duration:   506 seconds

    Stalling duration (avg): 225.5
    Stalling events:
     - 1485175673209, 648
     - 1485175676723, 121
     - 1485175685079, 40
     - 1485175685857, 93

    Quality switches:
     - 1485175673209, medium

Stalling events and quality switches are given in absolute (wall clock) timestamps plus milliseconds of stalling or the YouTube name for the quality level, respectively.

# License

The MIT License

Copyright (c) 2017 Werner Robitza

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.