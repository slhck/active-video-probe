/**
 * A player based on the HTMl5 API
 * The following attributes are accessible:
 * - probe      a reference to the ActiveProbe
 * - self       a reference to the the Html5Player class (this)
 * - player     a reference to the actual video player with the HTML5 API methods
 * - settings   Object with settings
 * 
 * @param ActiveProbe parent   the ActiveProbe parent
 * @param Object settings Settings to be passed to the player
 */
function Html5Player(parent, settings) {
    if (parent.constructor.name != "ActiveProbe") {
      throw new Error("The parent must be an ActiveProbe object")
    }

    this.probe = parent

    // default settings
    settings = settings || {}
    this.settings = Object.extend({
        width:  '854',
        height: '480',
        // videoUrl: 'http://www.quirksmode.org/html5/videos/big_buck_bunny.mp4',
        videoUrl: 'http://www.auby.no/files/video_tests/h264_720p_mp_3.1_3mbps_aac_shrinkage.mp4',
        // videoUrl: 'http://media.tagesschau.de/video/2014/0627/TV-20140627-1120-4701.webm.webm%',
        videoType: 'webm'
    }, settings)

    // Initialize the player
    var self = this 
    
    var videoTag = $('<video></video>', {
        id: 'html5-videotag',
        preload: 'auto',
        controls: true
    })

    // width and height need to be HTML attributes, not CSS
    $(videoTag).attr('width', this.settings.width)
    $(videoTag).attr('height', this.settings.height)

    var videoSrcTag = $('<source></source>', {
        src: this.settings.videoUrl,
        type: "video/" + this.settings.videoType,
    })

    if (!$.isReady) {
        throw new Error('Document is not ready yet while trying to load video player. Have you waited for $(document).ready()?')
    }

    videoSrcTag.appendTo(videoTag)
    videoTag.appendTo('#videoPlayer')

    // get the native DOM element of the video player
    this.player = $('#html5-videotag').get(0)
    self = this


    // stalling estimation
    this.checkInterval  = 300.0
    this.lastPlayPos    = 0
    this.currentPlayPos = 0
    this.stallingDetected = false
    setInterval(checkStalling, this.checkInterval)
    function checkStalling() {
        /*console.log("current time:        " + (new Date).getTime())
        console.log("current player time: " + self.player.currentTime)*/
        self.currentPlayPos = self.player.currentTime

        // checking offset, e.g. 1 / 50ms = 0.02
        var offset = 1 / self.checkInterval

        // if no stalling is currently detected,
        // and the position does not seem to increase
        // and the player isn't manually paused...
        if (
                !self.stallingDetected 
                && self.currentPlayPos < (self.lastPlayPos + offset)
                && !self.player.paused
            ) {
            self.probe.sendPlayerStateChange('stalling')
            self.stallingDetected = true
        }

        // if we were stalling but the player has advanced,
        // then there is no stalling
        if (
            self.stallingDetected 
            && self.currentPlayPos > (self.lastPlayPos + offset)
            && !self.player.paused
            ) {
            self.probe.sendPlayerStateChange('playing')
            self.stallingDetected = false
        }
        self.lastPlayPos = self.currentPlayPos
    }

    // player is playing -- this is the user event
    $(self.player).on('play', function(event) {
        self.probe.sendPlayerStateChange('playing')
    })

    // player is paused by the user
    $(self.player).on('pause', function(event) {
        self.probe.sendPlayerStateChange('paused')
    })

    // duration was found in the metadata
    $(self.player).on('durationchange', function(event) {
        self.probe.sendVideoDuration(self.player.durationl)
    })

    // video stopped
    $(self.player).on('ended', function(event) {
        self.probe.sendFinished()
    })    


    // player thinks it can play, meaning it's stopped stalling
    $(self.player).on('canplay', function(event) {
        if (!self.player.paused)
            self.probe.sendPlayerStateChange('playing')
    })
    // player thinks it can play through (send once again, who knows..)
    $(self.player).on('canplaythrough', function(event) {
        if (!self.player.paused)
            self.probe.sendPlayerStateChange('playing')
    })
    // waiting for data
    $(self.player).on('waiting', function(event) {
        self.probe.sendPlayerStateChange('stalling')
    })
    // stalled -- this is when the connection drops
    $(self.player).on('stalled', function(event) {
        if (!self.player.paused)
            self.probe.sendPlayerStateChange('stalling')
    })


    // player is loading data from the network
    $(self.player).on('progress', function(event) {

    })
    // player has stopped loading data from the network
    $(self.player).on('suspend', function(event) {

    })


    self.probe.sendPlayerReady()
    this.player.play()


}
