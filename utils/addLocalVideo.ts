import * as Video from 'twilio-video'

export default async function addLocalVideo(settings: Settings) {
  const $localVideo = document.getElementById('local-video')

  const localTracks = await Video.createLocalVideoTrack({
    deviceId: { exact: settings.defaultCamera },
  })

  $localVideo?.appendChild(localTracks.attach())

  const $videos = $localVideo?.querySelectorAll('video')

  // Remove all videos except the first one
  $videos?.forEach((video) => {
    if (video !== $videos[0]) {
      video.remove()
    }
  })

  if ($videos)
    $videos[0].classList.add('rounded-lg', 'shadow-lg', 'h-full', 'w-auto')
}

type Settings = {
  defaultCamera: string
  defaultMicrophone: string
}
