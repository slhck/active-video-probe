# Class for handling the connection to a Chrome instance
# via WebSockets
class ProbeConnection

  # extract the websocket URL for al new tab page,
  # or alternatively just take the most recent one
  def self.find_ws_url(json_response)
    json_response.each do |tab|
      if tab['url'] == 'chrome://newtab/'
        return tab['webSocketDebuggerUrl']
      end
    end
    Logger.warn "No New Tab URL found in this Chrome instance, falling back to first"
    json_response.first['webSocketDebuggerUrl']
  end

  def initialize(url, settings)
    @url = url
    @settings = settings
    @nextCommandId = 0

    @callbacks = {}
  end

  # Connect to the socket
  def connect
    @connection = EM::WebSocketClient.connect @url
    register_callbacks
  end

  # Register callbacks for socket events like messages, errors
  # and disconnects.
  def register_callbacks
    # successful connection
    @connection.callback do
      Logger.info "Connected to WebSocket: #{@url}"

      run_test
    end

    # when the socket couldn't be connected
    @connection.errback do |e|
      Logger.info "Couldn't connect: #{e}"
    end

    # when a message is received from the socket
    @connection.stream do |message|
      message = JSON.parse message.data
      Logger.info "Received message: " if $opts[:verbose]
      ap message if $opts[:verbose]

      # if the message contained a result
      if message['result']
        if message['id']
          # look for ID-based callback and pass it the result
          callback = @callbacks[message['id']]
          callback.call(message['result']) if callback
        end
      elsif message['method']
        # look for generic method callback, e.g.
        # https://developers.google.com/chrome-developer-tools/docs/protocol/tot/console#event-messageAdded
        callback = @callbacks[message['method']]
        callback.call(message['params']) if callback
      elsif message['error']
        Logger.info "Error returned: #{message['error']}"
      end
    end

    # when you close the browser or dev tools
    @connection.disconnect do
      Logger.info "Browser disconnected the WebSocket."
    end
  end

  # Alias for setting a callback proc based on named methods
  def on(method, proc)
    @callbacks[method] = proc
  end

  # Alias for sending a JSON message
  # You can pass a lambda or proc as a callback.
  def send(msg, callback = nil)
    msg['id'] = @nextCommandId
    @callbacks[@nextCommandId] = callback
    @connection.send_msg JSON.dump msg
    Logger.info "Sent message: #{msg}"
    @nextCommandId += 1
  end

  # Runs the actual test.
  # You can put any scripts for probing here.
  def run_test
    send({
      method: 'Page.navigate',
      params: { url: @settings.page_url }
    })

    # Enable network debugging
    # send({ method: 'Network.enable' })

    # Enable console debugging
    send({ method: 'Console.enable' })

    # Enable JavaScript runtime debugging
    send({ method: 'Runtime.enable' })

    # This is how you'd call something later -- just wrap it in
    # a thread.
    #
    # Thread.new do
    #   sleep 1
    #   send({
    #     method: 'Runtime.evaluate',
    #     params: {
    #       expression: "document.probe.initializePlayer('video-js')",
    #       returnByValue: true
    #     }
    #   }, lambda do |response|
    #     ap response
    #   end)
    # end

    $probe_results << ProbeResult.new

    # Pass console messages to ProbeResult if necessary
    on(
      'Console.messageAdded', lambda do |response|
        msg = response['message']['text']
        if msg.start_with? "[PROBE]"
          # remove starting probe identifier
          msg.slice! "[PROBE] "
          Logger.info "Received message: #{msg}"

          # decode the actual message content
          msg = JSON.parse msg rescue Logger.error "Could not decode the JSON message"

          # if the message says that the document is ready, initialize the video player
          if msg['event'] == "documentReady"
            cmd = <<-EOS
              document.probe.setPlayerSettings({
                'videoUrl': '#{@settings.video_url}'
              })
              document.probe.initializePlayer('#{@settings.technology}')
            EOS
            send({
              method: 'Runtime.evaluate',
              params: {
                expression: cmd
              }
              })
          else
            # else just pass the message on to the results class
            $probe_results.last.extract_message msg
          end
        end
      end
    )
  end

end