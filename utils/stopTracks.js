export function stopTracks(tracks) {
  tracks.forEach(function (track) {
    if (track) {
      track.stop()
    }
  })
}
