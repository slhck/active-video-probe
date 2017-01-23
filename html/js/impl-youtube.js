/**
 * A YouTube iFrame player based on the official YT API
 *
 * The following attributes are accessible:
 * - probe      a reference to the ActiveProbe
 * - self       a reference to the YouTubePlayer class (this)
 * - player     a reference to the actual video player with the YouTube API methods
 * - settings   Object with settings
 * - stateMap   Object with YouTube playing states and plaintext names
 * 
 * @link https://developers.google.com/youtube/iframe_api_reference
 * @param ActiveProbe parent   the ActiveProbe parent
 * @param Object settings Settings to be passed to the player
 */
function YouTubePlayer(parent, settings) {
    if (parent.constructor.name != "ActiveProbe") {
      throw new Error("The parent must be an ActiveProbe object")
    }

    this.probe = parent

    // default settings
    settings = settings || {}
    this.settings = Object.extend({
        height: '390',
        width:  '640',
        videoUrl: 'fhWaJi1Hsfo',
    }, settings)

    // if the user supplied a full HTTP URL, just get the videoId
    this.settings.videoUrl = this.settings.videoUrl.replace("http://www.youtube.com/watch?v=", "")

    // other variables that might be necessary
    this.stateMap = {
      '-1': 'unstarted',
      '0' : 'ended',
      '1' : 'playing',
      '2' : 'paused',
      '3' : 'stalling', // originally: buffering, but that's too imprecise for us
      '5' : 'videoCued'
    }

    // Initialize the player
    var self = this

    if (!YT || !YT.loaded) {
     throw new Error("YouTube iFrame API not loaded yet. Have you waited for onYouTubeIframeAPIReady?")
    }

    self.player = new YT.Player('player', {
      height:   self.settings.height,
      width:    self.settings.width,
      // Careful: YouTube only accepts IDs, not URLs
      videoId:  self.settings.videoUrl,
      events: {
        'onReady' : function(event) {
          event.target.playVideo()
          self.probe.sendPlayerReady()
          self.probe.sendVideoDuration(event.target.getDuration())
        },
        'onStateChange' : function(event) {
          self.probe.sendPlayerStateChange(self.stateMap[event.data])
          if (self.stateMap[event.data] == "ended") {
            self.probe.sendFinished()
          }
        },
        'onPlaybackQualityChange' : function(event) {
          self.probe.sendPlayerPlaybackQualityChange(event.data)
        },
      }
    })


}
