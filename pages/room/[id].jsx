import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LoadingIcon from '../../components/icons/Loading'
import PhoneIcon from '../../components/icons/Phone'
import MicIcon from '../../components/icons/Mic'
import CameraIcon from '../../components/icons/Camera'
import ScreenIcon from '../../components/icons/Screen'
import {
  getNhostSession,
  useAccessToken,
  useAuthenticated,
  useUserData,
} from '@nhost/nextjs'
import * as Video from 'twilio-video'
import getRoomData from '../../utils/getRoom'
import PreflightCheck from '../../components/preflightCheck'
import detachTracks from '../../utils/detachTracks'
import { stopTracks } from '../../utils/stopTracks'
import nhost from '../../libs/nhost'

const ServerSidePage = ({ user }) => {
  const router = useRouter()
  const id = router.query.id
  const [time, setTime] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [muted, setMuted] = useState(false)
  const [hideCamera, setHideCamera] = useState(false)
  const [preflight, setPreflight] = useState(false)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [room, setRoom] = useState()
  const [isCreator, setIsCreator] = useState(false)
  const [twilioRoom, setTwilioRoom] = useState()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([])
  const authenticated = useAuthenticated()
  const accessToken = useAccessToken()

  const [input, setInput] = useState('camera')

  useEffect(() => {
    if (!accessToken) {
      router.push('/')
    }

    const isPhone = checkDevice(navigator.userAgent)
    setIsMobile(isPhone)

    const preflightStorage = localStorage.getItem('preflight')
    if (preflightStorage) {
      setPreflight(true)
    }

    getRoomData(id)
      .then((data) => {
        const { creatorId } = data
        if (creatorId === user.id) {
          setIsCreator(true)
        }
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
    if (room) {
      const interval = setInterval(() => {
        const now = new Date()
        const start = new Date(room.addedDate)
        const diff = now - start
        // Always show 2 digits
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setTime(
          `${hours <= 9 ? '0' + hours : hours}:${
            minutes <= 9 ? '0' + minutes : minutes
          }:${seconds <= 9 ? '0' + seconds : seconds}`
        )
      }, 1000)

      return () => {
        console.log('cleaning up')
        if (twilioRoom) {
          twilioRoom.disconnect()
        }
        clearInterval(interval)
      }
    }
  }, [room])

  useEffect(() => {
    if (twilioRoom) {
      const participantsMap = twilioRoom.participants.values()
      const participantsArray = Array.from(participantsMap)

      setParticipants(participantsArray)

      participantsArray.forEach((participant) => {
        participantConnected(participant)
      })

      // Get participants
      twilioRoom.on('participantConnected', participantConnected)
      twilioRoom.on('participantDisconnected', participantDisconnected)
    }
  }, [twilioRoom])

  useEffect(() => {
    if (twilioRoom) {
      // Remove previous video tracks
      const localParticipant = twilioRoom.localParticipant
      const tracks = Array.from(localParticipant.videoTracks.values()).map(
        function (trackPublication) {
          return trackPublication.track
        }
      )
      localParticipant.unpublishTracks(tracks)
      detachTracks(tracks)
      stopTracks(tracks)

      // Add new video track
      if (input === 'camera') {
        const screenTrack = navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            const track = stream.getVideoTracks()[0]
            localParticipant.publishTrack(track)
          })
      } else if (input === 'screen') {
        const screenTrack = navigator.mediaDevices
          .getDisplayMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            const track = stream.getVideoTracks()[0]
            localParticipant.publishTrack(track)
          })
      }
    }
  }, [input])

  function participantConnected(participant) {
    const joinSound = document.getElementById('join-sound')
    joinSound.play()

    // Add participant to list
    const participantObject = {
      sid: participant.sid,
      identity: participant.identity,
    }

    participants.push(participantObject)

    setParticipants([...participants])

    const participantId = participant.identity

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

  function participantDisconnected(participant) {
    // Remove participant from list
    const participantObject = {
      sid: participant.sid,
      identity: participant.identity,
    }

    // Find participant by sid
    const index = participants.findIndex((p) => p.sid === participantObject.sid)
    if (index !== -1) {
      participants.splice(index, 1)
    }

    setParticipants([...participants])
  }

  const handleConnect = async () => {
    setConnecting(true)
    addLocalVideo(input)
    await connect(user.id, id, setTwilioRoom, twilioRoom, isCreator).catch(
      (error) => {
        console.log('Failed to connect: ', error)
        setError(true)
      }
    )
    setConnected(true)
    setConnecting(false)
  }

  const handleDisconnect = () => {
    // Remove all participants
    setParticipants([])
    twilioRoom.disconnect()
    setConnected(false)
  }

  const shape = Math.ceil(Math.sqrt(participants.length))

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-row items-center justify-center overflow-hidden bg-neutral-800 text-white">
      <audio
        id="join-sound"
        src="/sounds/join.mp3"
        className="absolute hidden"
      />
      {!preflight && <PreflightCheck setPreflight={setPreflight} />}
      <div
        className={`flex-0 grid h-screen max-h-screen w-4/5 grid-flow-col items-center justify-center rounded-lg px-2`}
        style={{
          gridTemplateColumns: `repeat(${shape}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${shape}, minmax(0, 1fr))`,
        }}
      >
        {participants.map((participant, index) => (
          <div
            className="participant relative rounded-lg p-2"
            key={index}
            id={`participant-${participant.identity}`}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <div className="video flex h-full max-h-full w-auto flex-col items-center justify-center self-center"></div>
            <div className="absolute top-0 w-full rounded-lg bg-opacity-25 p-4 text-center">
              <RenderName id={participant.identity} />
            </div>
          </div>
        ))}
      </div>
      <aside className="relative flex h-full w-96 flex-1 flex-col justify-end bg-gray-50">
        {connected && (
          <span className="absolute top-0 inline-flex w-full justify-center p-2 text-xl font-bold text-black">
            {time}
          </span>
        )}
        <div className="mt-10 mb-4 flex h-full w-full flex-col items-center justify-start px-4">
          <h3 className="w-full text-xl font-bold text-black">Participantes</h3>
          <div className="flex max-h-full w-full flex-col items-start justify-start">
            {participants.map((participant, index) => (
              <div className="flex w-full flex-row" key={index}>
                <RenderName
                  id={participant.identity}
                  className="w-full text-left text-lg text-black"
                />
              </div>
            ))}
          </div>
        </div>
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
        <span
          className="my-2 inline-flex items-center justify-center px-2"
          id="local-video"
        />
        {connected && (
          <div className="flex flex-row items-center justify-center">
            <button
              className={
                muted
                  ? 'my-2 mx-4 rounded-full bg-green-600 p-3 text-white transition hover:bg-green-700'
                  : 'relative my-2 mx-4 rounded-full bg-red-600 p-3 text-white transition hover:bg-red-700'
              }
              onClick={() => {
                setMuted(!muted)
                const localParticipant = twilioRoom.localParticipant
                const localTracks = Array.from(
                  localParticipant.audioTracks.values()
                )
                localTracks.forEach((track) => {
                  console.log(track.track)
                  if (!muted) {
                    track.track.disable()
                  } else {
                    track.track.enable()
                  }
                })
              }}
            >
              <MicIcon muted={muted} />
            </button>
            <button
              className="my-2 mx-4 rounded-full bg-red-600 p-3 text-white hover:bg-red-700"
              onClick={handleDisconnect}
            >
              <PhoneIcon />
            </button>
            <button
              className={
                hideCamera
                  ? 'my-2 mx-4 rounded-full bg-green-600 p-3 text-white transition hover:bg-green-700'
                  : 'relative my-2 mx-4 rounded-full bg-red-600 p-3 text-white transition hover:bg-red-700'
              }
              onClick={() => {
                setHideCamera(!hideCamera)
                const localParticipant = twilioRoom.localParticipant
                const localTracks = Array.from(
                  localParticipant.videoTracks.values()
                )
                localTracks.forEach((track) => {
                  console.log(track.track)
                  if (!hideCamera) {
                    track.track.disable()
                  } else {
                    track.track.enable()
                  }
                })
              }}
            >
              <CameraIcon hidden={hideCamera} />
            </button>
            {!isMobile && (
              <button
                className={
                  'my-2 mx-4 rounded-full bg-green-600 p-3 text-white transition hover:bg-green-700'
                }
                onClick={() => {
                  console.log(input)
                  if (input === 'camera') {
                    setInput('screen')
                  } else {
                    setInput('camera')
                  }
                }}
              >
                {input === 'camera' ? <ScreenIcon /> : <CameraIcon />}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

function attachTrack(track, id) {
  try {
    const $videoContainer = document.getElementById(`participant-${id}`)
    const $video = $videoContainer.querySelector('.video')
    $video.appendChild(track.attach())

    // Get video element
    const video = $video.querySelector('video')
    if (video) {
      // Add class to video element
      video.classList.add('inline-flex', 'items-center', 'justify-center')
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
    }
  } catch (error) {
    console.log('Failed to attach track: ', error)
  }
}

async function connect(userId, roomId, setRoom, room, isCreator) {
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

async function addLocalVideo(type, room) {
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

function RenderName({ id, className }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    const getName = async () => {
      const res = await nhost.graphql
        .request(
          `query {
      user(id: "${id}") {
        displayName
      }
    }`
        )
        .then((res) => {
          console.log(res)
          return res.data.user.displayName
        })
        .catch((err) => {
          console.log(err)
        })
      setName(res)
      setLoading(false)
    }
    getName()
  }, [id])

  if (loading) {
    return '...'
  }

  return <span className={className}>{name}</span>
}

// SERVER SIDE RENDERING
export async function getServerSideProps(context) {
  const nhostSession = await getNhostSession(
    'https://ggtmuhdidjxsglsqyfga.nhost.run',
    context
  )

  const user = nhostSession?.user || null

  return {
    props: {
      nhostSession,
      user,
    },
  }
}

function checkDevice(userAgent) {
  return (
    userAgent.match(/Android/i) ||
    userAgent.match(/webOS/i) ||
    userAgent.match(/iPhone/i) ||
    userAgent.match(/iPad/i) ||
    userAgent.match(/iPod/i) ||
    userAgent.match(/BlackBerry/i) ||
    userAgent.match(/Windows Phone/i)
  )
}

export default ServerSidePage
