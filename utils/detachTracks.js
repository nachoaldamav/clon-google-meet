export default function detachTracks(tracks) {
  tracks.forEach(function (track) {
    if (track) {
      track.detach().forEach(function (detachedElement) {
        detachedElement.remove()
      })
    }
  })
}
