import * as Video from 'twilio-video'

export default async function addLocalVideo(settings: Settings) {
  const $localVideo = document.getElementById('local-video')

  const previousVideo = $localVideo?.querySelector('video')
  if (previousVideo) {
    $localVideo?.removeChild(previousVideo)
  }

  try {
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
  } catch (error) {
    console.error("Couldn't add local video", error)
  }
}

type Settings = {
  defaultCamera: string
  defaultMicrophone: string
}
