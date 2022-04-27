export default function parseAudioTracks(participant: any) {
  // Get values from audioTracks map
  const audioTracks: any = Array.from(participant.audioTracks.values())
  return audioTracks[0].trackSid
}
