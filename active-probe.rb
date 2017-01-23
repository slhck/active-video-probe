#!/usr/bin/env ruby
#
# ActiveProbe
#
# Synopsis:  Connects to Google Chrome and runs probing scripts
# Author:    Werner Robitza, Telekom Innovation Laboratories
# Version:   0.1
#
# See also: http://www.igvita.com/2012/04/09/driving-google-chrome-via-websocket-api/

require 'em-http-request'
require 'em-websocket-client'
require 'json'
require 'ap'
require 'trollop'
require 'colored'
require 'ostruct'

require_relative 'lib/probe_event'
require_relative 'lib/probe_result'
require_relative 'lib/probe_connection'
require_relative 'lib/logger'

$probe_results = []

# =============================================================================

# Parse options
$opts = Trollop::options do
  version "ActiveProbe v0.1, Telekom Innovation Laboratories"
  opt :verbose,   "Verbose mode (prints all sent and received messages)"
  opt :ip,        "Probe IP (or hostname)", type: :string, default: "127.0.0.1"
  opt :port,      "Probe port", type: :string, default: "9222"
  opt :technology,"Test Technology (html5 or youtube)", type: :string, default: "html5"
  opt :host,      "Host for the HTML pages", type: :string, default: ""
  opt :video_url, "Video URL or ID (in case of YouTube) that should be played", type: :string, default: nil
end

# Determine endpoint URL depending on technology
if $opts[:host].empty?
  host = "file://#{Dir.pwd}/html/"
else
  host = $opts[:host]
end
case $opts[:technology].downcase
when "html5"
  page_url = "#{host}html5.html?#{Time.now.to_i}"
when "youtube"
  page_url = "#{host}youtube.html?#{Time.now.to_i}"
else
  Logger.error "No such technology available."
  exit
end

# Check for page URL
$opts[:video_url] ||= ""

# Settings for the probe
settings            = OpenStruct.new
settings.technology = $opts[:technology]
settings.video_url  = $opts[:video_url]
settings.page_url   = page_url

# Connect to Chrome and start probing
EM.run do
  chrome_url = "http://" + $opts[:ip] + ":" + $opts[:port] + "/json"
  Logger.info "Connecting to #{chrome_url}"

  conn = EM::HttpRequest.new(chrome_url).get

  conn.errback do
    Logger.error "Error in response"
    EM.stop
  end

  conn.callback do
    response = JSON.parse conn.response
    ws_url = ProbeConnection.find_ws_url response

    Logger.info "Found WebSocket URL: #{ws_url}"

    ws = ProbeConnection.new ws_url, settings
    ws.connect
  end

end