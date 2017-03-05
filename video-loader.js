/* global YT */

const videoLoader = (function () {
  function load (divId, url, onReady, onStateChange) {
    const videoId = url.replace(/.+=/, '')
    let player = createPlayer(divId, videoId, onReady, onStateChange)
    return player
  }

  function createPlayer (divId, videoId, onReady, onStateChange) {
    return new YT.Player(divId, {
      videoId: videoId,
      playerVars: { 'start': 0 },
      events: {
        onReady,
        onStateChange
      }
    })
  }

  return { load }
})()
