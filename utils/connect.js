import * as Video from 'twilio-video'

export async function connect(userId, roomId, setRoom, room, isCreator) {
  const response = await fetch(`/api/get-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identity: userId,
      id: roomId,
    }),
  })
  const data = await response.json()
  setRoom(
    await Video.connect(data.token, {
      name: roomId,
      dominantSpeaker: isCreator,
    })
  )
}
