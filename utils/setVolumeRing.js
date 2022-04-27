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
            const videoEl = participantEl.querySelector('video')
            if (participantEl) {
              videoEl.classList.add('border-green-500')
              videoEl.classList.remove('border-transparent')
            }
          }
        } else {
          if (participant) {
            const participantEl = document.getElementById(
              `participant-${participant.identity}`
            )
            const videoEl = participantEl.querySelector('video')
            if (participantEl) {
              videoEl.classList.remove('border-green-500')
              videoEl.classList.add('border-transparent')
            }
          }
        }
      })
    }
  })
}
