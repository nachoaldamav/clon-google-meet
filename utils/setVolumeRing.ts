import { RemoteAudioTrackStats } from 'twilio-video'

export default function setVolumeRing(twilioRoom: any, participants: any) {
  twilioRoom.getStats().then((stats: any) => {
    const remoteAudio = stats[0].remoteAudioTrackStats
    if (remoteAudio.length > 0) {
      remoteAudio.forEach((e: RemoteAudioTrackStats) => {
        const { audioLevel, trackSid } = e
        const participant = participants.find(
          (p: any) => p.audioTracks === trackSid
        )
        if (audioLevel && audioLevel > 500) {
          if (participant) {
            const participantEl = document.getElementById(
              `participant-${participant.identity}`
            )
            const videoEl = participantEl?.querySelector('video')?.classList
            const avatarEl = document.getElementById(
              `avatar-${participant.identity}`
            )?.classList
            if (participantEl) {
              videoEl?.add('camera-ring')
              videoEl?.remove('camera-ring-off')
            }
            if (avatarEl) {
              avatarEl.add('camera-ring')
              avatarEl.remove('border-transparent')
            }
          }
        } else {
          if (participant) {
            const participantEl = document.getElementById(
              `participant-${participant.identity}`
            )
            const videoEl = participantEl?.querySelector('video')?.classList
            const avatarEl = document?.getElementById(
              `avatar-${participant.identity}`
            )?.classList
            if (participantEl) {
              videoEl?.add('camera-ring-off')
              videoEl?.remove('camera-ring')
            }
            if (avatarEl) {
              avatarEl?.add('border-transparent')
              avatarEl?.remove('camera-ring')
            }
          }
        }
      })
    }
  })
}

type Props = {
  twilioRoom: any
  participants: any
}
