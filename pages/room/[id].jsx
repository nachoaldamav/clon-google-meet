import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  getNhostSession,
  useAccessToken,
  useAuthenticated,
} from '@nhost/nextjs'

import LoadingIcon from '../../components/icons/Loading'
import PhoneIcon from '../../components/icons/Phone'
import MicIcon from '../../components/icons/Mic'
import CameraIcon from '../../components/icons/Camera'
import ScreenIcon from '../../components/icons/Screen'
import MenuIcon from '../../components/icons/Menu'
import SettingsIcon from '../../components/icons/Settings'
import ExpandIcon from '../../components/icons/Expand'
import GridIcon from '../../components/icons/Grid'
import SettingsComponent from '../../components/SettingsPopup'
import RoomTimer from '../../components/RoomTimer'
import ParticipantMute from '../../components/ParticipantMute'
import getRoomData from '../../utils/getRoom'
import PreflightCheck from '../../components/preflightCheck'
import detachTracks from '../../utils/detachTracks'
import parseAudioTracks from '../../utils/getAudioTracks'
import { stopTracks } from '../../utils/stopTracks'
import setVolumeRing from '../../utils/setVolumeRing'
import Avatar from '../../components/Avatar'
import attachTrack from '../../utils/attachTrack'
import { connect } from '../../utils/connect'
import addLocalVideo from '../../utils/addLocalVideo'
import RenderName from '../../utils/renderName'
import checkDevice from '../../utils/checkDevice'
import ParticipantVideo from '../../components/Participant'
import GridLayout from '../../components/GridLayout'
import { AnimatePresence } from 'framer-motion'
import { useUserSettings } from '../../context/userSettings'
import CopyLink from '../../components/CopyLink'

const ServerSidePage = ({ user }) => {
  const router = useRouter()
  const authenticated = useAuthenticated()
  const accessToken = useAccessToken()
  const { settings } = useUserSettings()
  const [settingsPopup, setSettingsPopup] = useState(false)
  const id = router.query.id
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, router])

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

    return () => {
      if (twilioRoom) {
        twilioRoom.off('participantConnected', participantConnected)
        twilioRoom.off('participantDisconnected', participantDisconnected)
        twilioRoom.off('disconnected', () => {
          clearInterval(interval)
        })
      }
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
        navigator.mediaDevices
          .getUserMedia({
            video: {
              deviceId: settings.defaultCamera,
            },
            audio: {
              deviceId: settings.defaultMic,
            },
          })
          .then((stream) => {
            const track = stream.getVideoTracks()[0]
            localParticipant.publishTrack(track)
          })
          .catch((error) => {
            console.log('Failed sending video...', settings)
          })
      } else if (input === 'screen') {
        navigator.mediaDevices
          .getDisplayMedia({
            video: true,
            audio: {
              deviceId: { exact: settings.defaultMic },
            },
          })
          .then((stream) => {
            const track = stream.getVideoTracks()[0]
            localParticipant.publishTrack(track)
          })
      }
    }
  }, [input, twilioRoom, settings])

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
    addLocalVideo(settings)
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
        if (!muted) {
          track.track.disable()
        } else {
          track.track.enable()
        }
      })
    }
  }

  const addDemoParticipant = () => {
    const demoParticipant = {
      sid: 'demo',
      identity: '319a1842-4182-4b68-ae88-273c60bbbc93',
    }

    setParticipants((prevParticipants) => [
      ...prevParticipants,
      demoParticipant,
    ])
  }

  const shape = Math.sqrt(participants.length)

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-row items-center justify-center overflow-hidden bg-[#13111c] text-white">
      <CopyLink />
      <button
        className="group absolute top-0 left-0 z-[90] m-2 rounded border border-white bg-secondary p-2 text-white"
        onClick={() => setSettingsPopup(!settingsPopup)}
      >
        <SettingsIcon />
      </button>
      {settingsPopup && <SettingsComponent setPopUp={setSettingsPopup} />}
      <span className="pattern-dots absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center opacity-5 pattern-bg-transparent pattern-white pattern-size-4" />
      <audio
        id="join-sound"
        src="/sounds/join.mp3"
        className="absolute hidden"
      />
      <button
        className="visible absolute top-0 right-0 z-50 m-4 rounded border text-lg md:hidden"
        style={{
          color: !asideOpen ? '#fff' : 'white',
        }}
        onClick={() => setAsideOpen(!asideOpen)}
      >
        <MenuIcon />
      </button>
      {!preflight && <PreflightCheck setPreflight={setPreflight} />}
      <GridLayout hero={hero} shape={shape}>
        <AnimatePresence>
          {participants.map((participant, index) => (
            <ParticipantVideo
              key={index}
              participant={participant}
              hero={hero}
              shape={shape}
              setHero={setHero}
            />
          ))}
        </AnimatePresence>
      </GridLayout>
      <aside
        className={
          asideOpen
            ? 'relative flex h-full w-full flex-1 flex-col justify-end rounded-l-lg border-2 border-[#2e2b3b] bg-[#181622] text-white md:w-96'
            : 'relative hidden h-[95%] w-96 flex-1 flex-col justify-end rounded-l-lg border-2 border-[#2e2b3b] bg-[#181622] text-white md:flex'
        }
      >
        {connected && <RoomTimer room={room} />}
        <div className="hidden h-screen max-h-screen w-full flex-col items-center justify-start px-4 md:mb-4 md:mt-10 lg:flex ">
          <h3 className="w-full text-xl font-bold text-white">Participantes</h3>
          <div className="flex max-h-72 w-full flex-col items-start justify-start gap-2 overflow-x-auto ">
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
        <div
          className="relative my-2 inline-flex items-center justify-center px-2"
          id="local-video"
        >
          {input === 'screen' && (
            <span className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-30 text-xl font-bold text-white">
              Compartiendo pantalla
            </span>
          )}
        </div>
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
