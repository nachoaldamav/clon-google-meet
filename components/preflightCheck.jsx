import { useEffect, useState } from 'react'
import * as Video from 'twilio-video'
import { v4 as uuidv4 } from 'uuid'
import LoadingIcon from './icons/Loading'
import { motion } from 'framer-motion'
import MicIcon from './icons/Mic'
import AudioTest from './audio'

const stepList = [
  {
    id: 'mediaAcquired',
    title: 'Conexión de medios',
  },
  {
    id: 'connected',
    title: 'Conectado',
  },
  {
    id: 'mediaSubscribed',
    title: 'Subscripción de medios',
  },
  {
    id: 'mediaStarted',
    title: 'Inicio de cámara',
  },
  {
    id: 'dtlsConnected',
    title: 'Conexión DTLS',
  },
  {
    id: 'peerConnectionConnected',
    title: 'Conexión Peer a Peer',
  },
  {
    id: 'iceConnected',
    title: 'Conexión al servidor ICE',
  },
]

const stepsComponents = [
  {
    id: 1,
    title: '¡Vamos a empezar!',
    description:
      'Te ayudaremos a resolver cualquier problema de vídeo que tengas, pero primero vamos a comprobar tu configuración.',
    Component: () => {
      return (
        <div className="flex h-full w-full flex-col">
          <img
            src="/images/hangout.png"
            alt="Hangout"
            className="mx-auto my-4 w-64"
          />
        </div>
      )
    },
  },
  {
    id: 2,
    title: 'Comprobación de permisos',
    description:
      'Comprobamos que tienes los permisos necesarios para acceder a tu cámara y micrófono.',
    required: true,
    Component: (setPermissions) => {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <button
            className="my-2 mx-4 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
            onClick={() => setPermissions()}
          >
            Comprobar permisos
          </button>
        </div>
      )
    },
  },
  {
    id: 3,
    title: 'Comprueba tu cámara',
    description: 'Comprueba que tu cámara está funcionando correctamente.',
    Component: (setPermissions, currentStep) => {
      useEffect(() => {
        console.log('currentStep', currentStep)
        if (currentStep === 2) {
          const video = document.getElementById('local-video')
          const track = navigator.mediaDevices.getUserMedia({ video: true })
          track.then(function (stream) {
            video.srcObject = stream
          })
        } else {
          const video = document.getElementById('local-video')
          video.srcObject = null
        }
      }, [currentStep])

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-white py-4 shadow">
          <h3 className="text-center text-sm font-bold">Previsualización</h3>
          <video
            className="h-auto w-2/3 rounded"
            autoPlay
            playsInline
            muted
            id="local-video"
          />
        </div>
      )
    },
  },
  {
    id: 4,
    title: 'Comprueba tu micrófono',
    description: 'Comprueba que tu micrófono está funcionando correctamente.',
    Component: (setPermissions, currentStep) => {
      return (
        <div
          className=" mr-2 flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-white py-4 shadow-md"
          style={{}}
        >
          <AudioTest />
        </div>
      )
    },
  },
  {
    id: 5,
    title: 'Comprobación de conexión',
    description: 'Ahora vamos a comprobar tu conexión a internet.',
    end: true,
    Component: (setPermissions, currentStep, setToken, steps, setPreflight) => {
      const [loading, setLoading] = useState(false)
      const [sent, setSent] = useState(false)
      const [error, setError] = useState(false)
      const [stepsLenght, setStepsLenght] = useState(0)

      useEffect(() => {
        setStepsLenght(steps.length)
      }, [steps])

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border bg-white py-4">
          {!sent && (
            <button
              className="my-2 mx-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
              onClick={() => {
                setLoading(true)
                fetch('/api/get-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: uuidv4(),
                    identity: uuidv4(),
                  }),
                })
                  .then((res) => res.json())
                  .then((res) => {
                    setLoading(false)
                    setSent(true)
                    setToken(res.token)
                  })
                  .catch((err) => {
                    setLoading(false)
                    setError(true)
                  })
              }}
            >
              {loading ? (
                <>
                  <LoadingIcon /> Enviando...
                </>
              ) : (
                <>Empezar test</>
              )}
            </button>
          )}
          {sent && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <h3 className="text-center text-sm font-bold">
                {stepsLenght} / 7 test completados
              </h3>
              {stepsLenght >= 7 && !error && (
                <h4 className="text-center text-sm font-bold text-green-500">
                  ¡Todo listo!
                </h4>
              )}
              {error && (
                <>
                  <h4 className="text-center text-sm font-bold text-red-500">
                    Ha ocurrido un error, inténtalo de nuevo
                  </h4>
                  <button
                    className="my-2 mx-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
                    onClick={() => {
                      setPreflight(true)
                      window.localStorage.setItem('preflight', true)
                    }}
                  >
                    Continuar igualmente
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )
    },
  },
]

export default function PreflightCheck({ status, setPreflight }) {
  const runPreflight = Video.runPreflight
  const [token, setToken] = useState(null)
  const [correct, setCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState(null)
  const [error, setError] = useState(false)
  const [steps, setSteps] = useState([])
  const [step, setStep] = useState(0)

  // Check permissions

  const checkPermissions = async () => {
    navigator.permissions.query({ name: 'camera' }).then((result) => {
      if (result.state === 'granted') {
        setPermissions(true)
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then(() => {
            setPermissions(true)
          })
      }
    })
  }

  useEffect(() => {
    if (token) {
      const preflight = runPreflight(token)
      preflight.on('progress', (progress) => {
        console.log('Preflight check progress:', progress)
        setSteps((prevSteps) => [...prevSteps, progress])
      })

      preflight.on('failed', (error, report) => {
        console.error('preflight error:', error)
        console.log('Received partial report:', report)
      })

      preflight.on('completed', (report) => {
        setCorrect(true)
        setLoading(false)
        console.log(
          'Test completed in ' + report.testTiming.duration + ' milliseconds.'
        )
        console.log(
          ' It took ' +
            report.networkTiming.connect?.duration +
            ' milliseconds to connect'
        )
        console.log(
          ' It took ' +
            report.networkTiming.media?.duration +
            ' milliseconds to receive media'
        )
      })
    }
  }, [token])

  useEffect(() => {
    if (step === 1) {
      if (!permissions) {
        checkPermissions()
      } else {
        setStep(2)
      }
    }
  }, [permissions])

  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-row items-center justify-center bg-gray-400 bg-opacity-60 p-4 text-black">
      <div className="relative my-10 h-full rounded-lg bg-white p-4 md:w-1/2">
        <div className="h-full w-full">
          <div
            className="absolute top-0 left-0 mx-10 flex h-fit flex-col justify-evenly overflow-y-hidden"
            style={{
              transform: `translateY(calc(15vh - ${step * 225}px + 50px))`,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <h1
              className="text-4xl font-bold"
              style={{
                opacity: step === 0 ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Preflight Test
            </h1>
            {stepsComponents.map((data, index) => {
              return (
                <motion.div
                  key={data.id}
                  className={`flex flex-row items-center justify-center`}
                  style={{
                    opacity:
                      index === step ? 1 : isVisible(index, step) ? 0.5 : 0,

                    cursor: index !== step ? 'pointer' : 'default',
                    transition: 'opacity 0.2s',
                  }}
                  animate={{
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  onClick={() => {
                    if (index !== step) {
                      setStep(index)
                    }
                  }}
                >
                  <div className="flex h-64 w-1/2 flex-col items-start justify-center gap-2">
                    <h3 className="w-full text-left text-2xl font-bold">
                      {data.title}
                    </h3>
                    <p className="w-full text-left text-sm font-normal text-gray-600">
                      {data.description}
                    </p>
                    {!data.required && (
                      <button
                        className=" rounded bg-blue-500 py-2 px-4 font-bold text-white transition duration-150 ease-in-out"
                        style={{
                          opacity: index === step ? 1 : 0,
                        }}
                        onClick={() => {
                          if (data.end) {
                            setPreflight(true)
                            window.localStorage.setItem('preflight', true)
                          } else {
                            setStep(index + 1)
                          }
                        }}
                      >
                        {data.end ? 'Finalizar' : 'Siguiente'}
                      </button>
                    )}
                  </div>
                  <div className="flex w-1/2 flex-col items-center justify-center">
                    <RenderComponent
                      id={data.id}
                      setPermissions={checkPermissions}
                      currentStep={step}
                      setToken={setToken}
                      steps={steps}
                      setPreflight={setPreflight}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function RenderComponent({
  id,
  setPermissions,
  currentStep,
  setToken,
  steps,
  setPreflight,
}) {
  const step = stepsComponents.find((step) => step.id === id)
  return step.Component
    ? step.Component(
        setPermissions,
        (currentStep = currentStep),
        setToken,
        steps,
        setPreflight
      )
    : null
}

function isVisible(index, currentStep) {
  // Hide if is 1 up or 1 down
  if (index === currentStep - 1 || index === currentStep + 1) {
    return true
  } else if (index === currentStep) {
    return true
  } else {
    return false
  }
}
