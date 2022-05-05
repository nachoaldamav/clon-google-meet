import * as Video from 'twilio-video'

export default async function addLocalVideo(type, room) {
  const $localVideo = document.getElementById('local-video')

  const localTracks = await Video.createLocalVideoTrack({
    audio: {
      name: 'microphone',
    },
    video: {
      name: 'camera',
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  })

  $localVideo.appendChild(localTracks.attach())

  const $videos = $localVideo.querySelectorAll('video')

  // Remove all videos except the first one
  $videos.forEach((video) => {
    if (video !== $videos[0]) {
      video.remove()
    }
  })

  $videos[0].classList.add('rounded-lg', 'shadow-lg', 'h-full', 'w-auto')
}
