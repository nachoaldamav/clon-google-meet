import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LoadingIcon from '../../components/icons/Loading'
import PhoneIcon from '../../components/icons/Phone'
import MicIcon from '../../components/icons/Mic'
import CameraIcon from '../../components/icons/Camera'
import ScreenIcon from '../../components/icons/Screen'
import MenuIcon from '../../components/icons/Menu'
import ExpandIcon from '../../components/icons/Expand'
import GridIcon from '../../components/icons/Grid'
import ParticipantMute from '../../components/ParticipantMute'
import {
  getNhostSession,
  useAccessToken,
  useAuthenticated,
} from '@nhost/nextjs'
import * as Video from 'twilio-video'
import getRoomData from '../../utils/getRoom'
import PreflightCheck from '../../components/preflightCheck'
import detachTracks from '../../utils/detachTracks'
import parseAudioTracks from '../../utils/getAudioTracks'
import { stopTracks } from '../../utils/stopTracks'
import setVolumeRing from '../../utils/setVolumeRing'
import Avatar from '../../components/avatar'
import attachTrack from '../../utils/attachTrack'
import { connect } from '../../utils/connect'
import addLocalVideo from '../../utils/addLocalVideo'
import RenderName from '../../utils/renderName'
import checkDevice from '../../utils/checkDevice'

const ServerSidePage = ({ user }) => {
  const router = useRouter()
  const id = router.query.id
  const [time, setTime] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [asideOpen, setAsideOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [hideCamera, setHideCamera] = useState(false)
  const [preflight, setPreflight] = useState(false)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [room, setRoom] = useState()
  const [isCreator, setIsCreator] = useState(false)
  const [hero, setHero] = useState(false)
  const [twilioRoom, setTwilioRoom] = useState()
  const [participants, setParticipants] = useState([])
  const authenticated = useAuthenticated()
  const accessToken = useAccessToken()

  const [input, setInput] = useState('camera')

  useEffect(() => {
    if (!accessToken) {
      router.push(`/?redirect=room/${id}`)
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
      })
      .catch((error) => {
        console.log('Failed loading room: ', error)
      })
  }, [authenticated, router, id, user.id, accessToken])

  useEffect(() => {
    if (room) {
      const interval = setInterval(() => {
        const now = new Date()
        const start = new Date(room.addedDate)
        const diff = now - start

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
  }, [room, twilioRoom])

  useEffect(() => {
    if (twilioRoom) {
      let interval
      try {
        interval = setInterval(() => {
          setVolumeRing(twilioRoom, participants)
        }, 1000)
      } catch (error) {
        console.log('error', error)
        clearInterval(interval)
      }

      const participantsMap = twilioRoom.participants.values()
      const participantsArray = Array.from(participantsMap)

      setParticipants(participantsArray)

      participantsArray.forEach((participant) => {
        participantConnected(participant)
      })

      // Get participants
      twilioRoom.on('participantConnected', participantConnected)
      twilioRoom.on('participantDisconnected', participantDisconnected)

      // Clear interval when disconnected
      twilioRoom.on('disconnected', () => {
        clearInterval(interval)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [input, twilioRoom])

  function participantConnected(participant) {
    const joinSound = document.getElementById('join-sound')
    joinSound.play()

    // Add participant to list
    const participantObject = {
      sid: participant.sid,
      identity: participant.identity,
      audioTracks: parseAudioTracks(participant),
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

  const handleMute = () => {
    if (twilioRoom) {
      if (muted) {
        setMuted(false)
      } else {
        setMuted(true)
      }
      const localParticipant = twilioRoom.localParticipant
      const localTracks = Array.from(localParticipant.audioTracks.values())
      localTracks.forEach((track) => {
        console.log(track.track)
        if (!muted) {
          track.track.disable()
        } else {
          track.track.enable()
        }
      })
    }
  }

  const shape = Math.sqrt(participants.length)

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-row items-center justify-center overflow-hidden bg-[#13111c] text-white">
      <span className="pattern-dots absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center opacity-5 pattern-bg-transparent pattern-white pattern-size-4" />
      <audio
        id="join-sound"
        src="/sounds/join.mp3"
        className="absolute hidden"
      />
      <button
        className="visible absolute top-0 right-0 z-50 m-4 rounded border text-lg md:hidden"
        style={{
          color: !asideOpen ? '#fff' : '#000',
        }}
        onClick={() => setAsideOpen(!asideOpen)}
      >
        <MenuIcon />
      </button>
      {!preflight && <PreflightCheck setPreflight={setPreflight} />}
      <div
        className={`flex-0 grid h-screen max-h-screen w-4/5 grid-flow-col items-center justify-center rounded-lg px-2`}
        style={
          !hero
            ? {
                gridTemplateColumns: `repeat(${Math.ceil(shape)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.round(
                  shape
                )}, minmax(0, 1fr))`,
                gap: '0.5rem',
                gridAutoRows: '1fr',
                height: '100%',
              }
            : {
                gridTemplateColumns: `repeat(${Math.ceil(
                  shape
                )}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${Math.round(
                  shape
                )}, minmax(0, 1fr))`,
                gap: '0.1rem',
                gridAutoRows: '1fr',
                height: '100%',
              }
        }
      >
        {participants.map((participant, index) => (
          <div
            className="participant relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-transparent p-2"
            key={index}
            id={`participant-${participant.identity}`}
            style={
              hero && `participant-${participant.identity}` === hero
                ? {
                    gridColumnStart: 1,
                    gridColumnEnd: `${Math.ceil(shape - 1)}`,
                    gridRowStart: 1,
                    gridRowEnd: `${Math.ceil(shape - 1)}`,
                    height: '100%',
                    width: '100%',
                  }
                : {
                    height: '100%',
                    width: '100%',
                  }
            }
            onClick={() => {
              if (hero !== `participant-${participant.identity}`) {
                setHero(`participant-${participant.identity}`)
              } else {
                setHero(false)
              }
            }}
          >
            <div className="video relative flex h-full max-h-full w-auto flex-col items-center justify-center self-center bg-secondary">
              <span className="absolute z-0 flex flex-col items-center justify-center">
                <Avatar name={participant.identity} />
                <span className="text-center text-xl font-semibold">
                  <RenderName id={participant.identity} />
                </span>
              </span>
            </div>
            <div className="absolute top-0 w-full rounded-lg bg-opacity-25 p-4 text-center">
              <RenderName id={participant.identity} />
            </div>
          </div>
        ))}
      </div>
      <aside
        className={
          asideOpen
            ? 'relative flex h-full w-96 flex-1 flex-col justify-end rounded-l-lg border-2 border-[#2e2b3b] bg-[#181622] text-white'
            : 'relative hidden h-[95%] w-96 flex-1 flex-col justify-end rounded-l-lg border-2 border-[#2e2b3b] bg-[#181622] text-white md:flex'
        }
      >
        {connected && (
          <span className="absolute top-0 inline-flex w-full justify-center p-2 text-xl font-bold text-white">
            {time}
          </span>
        )}
        <div className="hidden h-screen max-h-screen w-full flex-col items-center justify-start px-4 md:mb-4 md:mt-10 lg:flex ">
          <h3 className="w-full text-xl font-bold text-white">Participantes</h3>
          <div className="flex max-h-full w-full flex-col items-start justify-start ">
            {participants.map((participant, index) => (
              <div
                className="group flex w-full flex-row items-center justify-between gap-2"
                key={index}
              >
                <div className="inline-flex items-center justify-start gap-2">
                  <span
                    className="inline-flex items-center justify-center rounded-full border-[3px]"
                    id={`avatar-${participant.identity}`}
                  >
                    <Avatar name={participant.identity} />
                  </span>
                  <RenderName
                    id={participant.identity}
                    className="max-w-[10rem] truncate text-left text-lg text-white"
                  />
                </div>
                <div className="inline-flex items-center justify-start gap-2">
                  <button
                    className="text-right text-xl text-gray-500 opacity-0 transition duration-150 group-hover:opacity-100"
                    onClick={() => {
                      if (hero === `participant-${participant.identity}`) {
                        setHero(false)
                      } else {
                        setHero(`participant-${participant.identity}`)
                      }
                    }}
                  >
                    {hero !== participant.identity ? (
                      <ExpandIcon />
                    ) : (
                      <GridIcon />
                    )}
                  </button>
                  <ParticipantMute id={participant.identity} />
                </div>
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
                handleMute()
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

export default ServerSidePage
