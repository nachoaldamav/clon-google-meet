import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LoadingIcon from '../../components/icons/Loading'
import {
  getNhostSession,
  useAccessToken,
  useAuthenticated,
  useUserData,
} from '@nhost/nextjs'
import * as Video from 'twilio-video'
import getRoomData from '../../utils/getRoom'

const Peers = []

const ServerSidePage = ({ user }) => {
  const router = useRouter()
  const id = router.query.id
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [room, setRoom] = useState()
  const [twilioRoom, setTwilioRoom] = useState()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([
    {
      identity: user.id,
      name: user.displayName,
    },
  ])
  const authenticated = useAuthenticated()
  const accessToken = useAccessToken()

  useEffect(() => {
    if (!accessToken) {
      console.log('redirecting to /')
      router.push('/')
    }

    getRoomData(id)
      .then((data) => {
        setRoom(data)
        setLoading(false)
      })
      .catch((error) => {
        console.log('Failed loading room: ', error)
        setError(true)
        setLoading(false)
      })
  }, [authenticated, router])

  useEffect(() => {
    if (twilioRoom) {
      console.log('twilioRoom', twilioRoom)

      // Get participants
      twilioRoom.on('participantConnected', participantConnected)
    }
  }, [twilioRoom])

  function participantConnected(participant) {
    // Add participant to list
    setParticipants((prevParticipants) => [...prevParticipants, participant])
    console.log('participantConnected', participants)

    const participantId = participant.identity
    console.log('participantId', participantId)

    participant.tracks.forEach((localTrackPublication) => {
      const { isSuscribed, track } = localTrackPublication
      if (isSuscribed) {
        attachTrack(track, participantId)
      }
    })
    participant.on('trackSubscribed', (track) => {
      attachTrack(track, participantId)
    })
    participant.on('trackUnsubscribed', (track) => track.detach())
  }

  const handleConnect = async () => {
    setConnecting(true)
    addLocalVideo()
    await connect(user.id, id, setTwilioRoom, twilioRoom).catch((error) => {
      console.log('Failed to connect: ', error)
      setError(true)
    })
    setConnected(true)
    setConnecting(false)
  }

  const handleDisconnect = () => {
    twilioRoom.disconnect()
    setConnected(false)
  }

  return (
    <div className="flex h-screen max-h-screen w-full flex-row items-center justify-center overflow-hidden bg-neutral-800 text-white">
      <div className="flex-0 flex h-full w-4/5 flex-row flex-wrap items-center justify-center rounded-lg">
        {participants.map((participant, index) => (
          <div
            className="participant relative m-2 rounded-lg"
            key={index}
            id={`participant-${participant.identity}`}
            style={{
              width:
                participants > 4 ? '25%' : participants > 2 ? '33%' : 'auto',
              minWidth: '45%',
              minHeight: '25%',
              height: 'auto',
              maxHeight: '45%',
            }}
          >
            <div className="video h-auto"></div>
            <div className="absolute top-0 right-0 p-2">
              <span>{participant.identity}</span>
            </div>
          </div>
        ))}
      </div>
      <aside className="relative flex h-full w-full flex-1 flex-col justify-end bg-gray-50">
        {!connected && (
          <button
            className="my-2 mx-4 rounded-lg border-2 bg-white px-2 py-1 text-black"
            onClick={handleConnect}
          >
            {connecting ? (
              <span className="flex flex-row items-center justify-center">
                <LoadingIcon />
                <span className="ml-2">Conectando...</span>
              </span>
            ) : (
              <>
                <span className="inline-block">Conectar</span>
              </>
            )}
          </button>
        )}
        {connected && (
          <button
            className="my-2 mx-4 rounded-lg border-2 bg-red-600 px-2 py-1 text-white"
            onClick={handleDisconnect}
          >
            Desconectarse
          </button>
        )}
        <span
          className="my-2 inline-flex items-center justify-center px-2"
          id="local-video"
        />
      </aside>
    </div>
  )
}

function attachTrack(track, id) {
  const elId = `participant-${id}`
  try {
    const $video = document.getElementById(`participant-${id}`)
    $video.appendChild(track.attach())
  } catch (error) {
    console.log('Failed to attach track: ', error)
  }
}

async function connect(userId, roomId, setRoom, room) {
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
  setRoom(await Video.connect(data.token, { name: roomId }))
}

async function addLocalVideo() {
  const $localVideo = document.getElementById('local-video')
  const localTracks = await Video.createLocalVideoTrack()
  $localVideo.appendChild(localTracks.attach())

  // Get videos inside local video container
  const $videos = $localVideo.querySelectorAll('video')
  // Remove all videos except the first one
  $videos.forEach((video) => {
    if (video !== $videos[0]) {
      video.remove()
    }
  })

  // Add classes to video
  $videos[0].classList.add(
    'rounded-lg',
    'shadow-lg',
    'h-full',
    'w-auto',
    'object-cover'
  )
}

// SERVER SIDE RENDERING
export async function getServerSideProps(context) {
  const nhostSession = await getNhostSession(
    'https://ggtmuhdidjxsglsqyfga.nhost.run',
    context
  )

  const user = nhostSession?.user

  return {
    props: {
      nhostSession,
      user,
    },
  }
}

export default ServerSidePage
