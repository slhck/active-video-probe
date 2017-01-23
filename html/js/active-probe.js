Object.extend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
};

/**
 * ActiveProbe class.
 *
 * This is a class to call functions on, which send data to the probe controller.
 * The actual video players are initialized from within here (the "initialize" function)
 *
 * This class holds a reference to its child player, and it should be absolutely
 * service-independent. No special-casing here! This is done by the "player" object
 *
 * @author Werner Robitza
 * @param Object settings Settings that should be overwritten. Can be one of:
 *                    - prefix
 */
function ActiveProbe(settings) {
    if (!window.jQuery) {
      throw new Error("jQuery not loaded!")
    }

    settings = settings || {}

    // default settings
    this.settings = Object.extend(settings, {
        prefix: '[PROBE] ',
    })

}


ActiveProbe.prototype.log = function(message) {
    message.timestamp = new Date().getTime()
    console.log(this.settings.prefix + JSON.stringify(message))
}

/**
 * Set settings for the player to be loaded later, this can include
 * video IDs, width, height, etc.
 * @param Object settings
 */
ActiveProbe.prototype.setPlayerSettings = function(settings) {
    this.playerSettings = settings;
}

/**
 * Tell the probe that the page has loaded
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendPageLoaded = function() {
    this.log({
        'event'    : 'pageLoaded',
        'message'  : 'Page loaded',
        'data'     : ''
    })
    return this
}

/**
 * Tell the probe that the DOM is ready, which is usually the time
 * when you want to initialize the player
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendDocumentReady = function() {
    this.log({
        'event'     : 'documentReady',
        'message'   : 'Document Ready',
        'data'      : ''
    })
}

/**
 * Tell the probe that the player is ready to start playing, e.g. the API being loaded
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendPlayerReady = function() {
    this.log({
        'event'    : 'playerReady',
        'message'  : 'Player ready',
        'data'     : ''
    })
    return this
}

/**
 * Tell the probe that the page has loaded
 * @param string state The state which will be translated according to the current state map
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendPlayerStateChange = function(state) {
    this.log({
        'event'    : 'playerStateChange',
        'message'  : 'Player state changed to ' + state,
        'data'     : state
    })
    return this
}

/**
 * Tell the probe that the player quality has changed
 * @param string quality The quality that will be logged
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendPlayerPlaybackQualityChange = function(quality) {
    this.log({
        'event'    : 'playerQualityChange',
        'message'  : 'Player quality changed to ' + quality,
        'data'     : quality
    })
    return this
}

/**
 * Tell the probe about the video duration
 * @param string duration the duration
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendVideoDuration = function(duration) {
    this.log({
        'event'    : 'videoDuration',
        'message'  : 'Video duration is ' + duration,
        'data'     : duration
    })
    return this
}

/**
 * Tell the probe that the probing is finished and no further events should be handled
 * @return ActiveProbe
 */
ActiveProbe.prototype.sendFinished = function() {
    this.log({
        'event'    : 'finished',
        'message'  : 'Probing finished',
        'data'     : ''
    })
    return this
}

/**
 * Initializes the actual probe, e.g. a YouTube player
 * @param  string service  The service to be loaded (e.g. youtube)
 * @param  Object settings Settings to be passed to the player, these will override previously
 *                         set settings from the setPlayerSettings call
 */
ActiveProbe.prototype.initializePlayer = function(service, playerSettings) {
    // default settings are overridden
    playerSettings = playerSettings || {}
    this.playerSettings = Object.extend(this.playerSettings, playerSettings)

    switch(service.toLowerCase()) {
        case 'youtube':
            this.player = new YouTubePlayer(this, this.playerSettings)
            break
        case 'vimeo':
            this.player = new VimeoPlayer(this, this.playerSettings)
            break
        case 'video-js':
            this.player = new VideoJsPlayer(this, this.playerSettings)
            break
        case 'html5':
            this.player = new Html5Player(this, this.playerSettings)
            break
        default:
            throw new Error("Error: No such player available.")
    }
}