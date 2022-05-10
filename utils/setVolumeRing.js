export default function setVolumeRing(twilioRoom, participants) {
  twilioRoom.getStats().then((stats) => {
    const remoteAudio = stats[0].remoteAudioTrackStats
    if (remoteAudio.length > 0) {
      remoteAudio.forEach((e) => {
        const { audioLevel, trackSid } = e
        const participant = participants.find((p) => p.audioTracks === trackSid)
        if (audioLevel > 500) {
          if (participant) {
            const participantEl = document.getElementById(
              `participant-${participant.identity}`
            )
            const videoEl = participantEl?.querySelector('video')?.classList
            const avatarEl = document.getElementById(
              `avatar-${participant.identity}`
            ).classList
            if (participantEl) {
              videoEl.add('camera-ring')
              videoEl.remove('camera-ring-off')
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
            const avatarEl = document.getElementById(
              `avatar-${participant.identity}`
            ).classList
            if (participantEl) {
              videoEl.add('camera-ring-off')
              videoEl.remove('camera-ring')
            }
            if (avatarEl) {
              avatarEl.add('border-transparent')
              avatarEl.remove('camera-ring')
            }
          }
        }
      })
    }
  })
}
