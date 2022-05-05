export default function attachTrack(track, id) {
  try {
    const $videoContainer = document.getElementById(`participant-${id}`)
    const $video = $videoContainer.querySelector('.video')
    $video.appendChild(track.attach())

    const video = $video.querySelector('video')
    if (video) {
      video.classList.add(
        'inline-flex',
        'items-center',
        'justify-center',
        'border-2',
        'z-10'
      )
      // Force video size
      video.setAttribute('width', '100%')
      video.setAttribute('height', '100%')

      // Keep last one video remove others
      const videos = $videoContainer.querySelectorAll('video')
      videos.forEach((e, index) => {
        if (index !== videos.length - 1) {
          e.remove()
        }
      })

      const audioEl = $videoContainer.querySelector('audio')
      if (audioEl) {
        audioEl.id = `video-${id}`
      }
    }
  } catch (error) {
    console.log('Failed to attach track: ', error)
  }
}
