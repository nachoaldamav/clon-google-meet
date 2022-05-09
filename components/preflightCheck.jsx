import { useEffect, useState } from 'react'
import * as Video from 'twilio-video'
import { motion } from 'framer-motion'
import {
  Start,
  Permissions,
  CheckCamera,
  CheckMicrophone,
  CheckConnection,
} from './preflightSteps'

const stepsComponents = [
  {
    id: 1,
    title: '¡Vamos a empezar!',
    description:
      'Te ayudaremos a resolver cualquier problema de vídeo que tengas, pero primero vamos a comprobar tu configuración.',
    Component: () => <Start />,
  },
  {
    id: 2,
    title: 'Comprobación de permisos',
    description:
      'Comprobamos que tienes los permisos necesarios para acceder a tu cámara y micrófono.',
    required: true,
    Component: (setPermissions) => (
      <Permissions setPermissions={setPermissions} />
    ),
  },
  {
    id: 3,
    title: 'Comprueba tu cámara',
    description:
      'Selecciona una cámara y comprueba que funciona. (Tu selección se guardará)',
    Component: (setPermissions, currentStep) => (
      <CheckCamera currentStep={currentStep} />
    ),
  },
  {
    id: 4,
    title: 'Comprueba tu micrófono',
    description:
      'Selecciona un micrófono y comprueba que funciona. (Tu selección se guardará)',
    Component: () => <CheckMicrophone />,
  },
  {
    id: 5,
    title: 'Comprobación de conexión',
    description: 'Ahora hay que comprobar que tu conexión está funcionando.',
    required: true,
    end: true,
    Component: (setPermissions, currentStep, setToken, steps, setPreflight) => (
      <CheckConnection
        setToken={setToken}
        steps={steps}
        setPreflight={setPreflight}
      />
    ),
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
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-row items-center justify-center bg-gray-400 bg-opacity-60 p-4 text-white">
      <div className="relative my-10 h-full w-full rounded-lg bg-primary p-4 md:w-1/2">
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
