import { useEffect, useState } from 'react'
import AudioTest from '../audio'
import CheckConn from './CheckConn'

export function Start() {
  return (
    <div className="flex h-full w-full flex-col">
      <img
        src="/images/hangout.svg"
        alt="Hangout"
        className="mx-auto my-4 w-64"
      />
    </div>
  )
}

export function Permissions({ setPermissions }) {
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
}

export function CheckCamera({ currentStep }) {
  const [inputs, setInputs] = useState()

  useEffect(() => {
    if (currentStep === 2) {
      const video = document.getElementById('local-video')
      const track = navigator.mediaDevices.getUserMedia({ video: true })
      track.then(function (stream) {
        video.srcObject = stream
      })

      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const cameraInputs = devices.filter(
          (device) => device.kind === 'videoinput'
        )
        setInputs(cameraInputs)
      })
    } else {
      const video = document.getElementById('local-video')
      video.srcObject = null
    }
  }, [currentStep])

  function handleChange(e) {
    const video = document.getElementById('local-video')
    const track = navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: e.target.value,
      },
    })
    track.then(function (stream) {
      video.srcObject = stream
    })
    setCamera(e.target.value)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-[#2e2b3b] bg-secondary py-4 shadow">
      <h3 className="text-center text-sm font-bold">Previsualización</h3>
      <video
        className="h-auto w-2/3 rounded"
        autoPlay
        playsInline
        muted
        id="local-video"
      />
      <select
        onChange={handleChange}
        className="mx-4 w-2/3 rounded bg-primary text-white"
      >
        {inputs &&
          inputs.map((input) => (
            <option key={input.deviceId} value={input.deviceId}>
              {input.label}
            </option>
          ))}
      </select>
    </div>
  )
}

export function CheckMicrophone() {
  return (
    <div className=" mr-2 flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-secondary py-4 shadow-md">
      <AudioTest />
    </div>
  )
}

export const CheckConnection = ({ setToken, steps, setPreflight }) => (
  <CheckConn setToken={setToken} steps={steps} setPreflight={setPreflight} />
)
