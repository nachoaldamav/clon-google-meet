import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUserSettings } from '../context/userSettings'
import MicIcon from './icons/Mic'

export default function AudioTest() {
  const [volume, setVolume] = useState(0)
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([])
  const [selectedInput, setSelectedInput] = useState<any | null>(null)

  const {
    settings,
    setSettings,
  }: {
    settings: { defaultMicrophone: string }
    setSettings: (settings: { defaultMicrophone: string }) => void
  } = useUserSettings()

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setInputs(devices.filter((device) => device.kind === 'audioinput'))
    })

    const media = navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)

        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 1024

        microphone.connect(analyser)
        analyser.connect(javascriptNode)
        javascriptNode.connect(audioContext.destination)

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(array)
          let length = array.length
          let total = 0
          for (let i = 0; i < length; i++) {
            total += array[i]
          }
          const average = total / length
          setVolume(average)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedInput) {
      setSettings({ ...settings, defaultMicrophone: selectedInput })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInput])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="inline-flex w-full items-center gap-2 px-2">
        <MicIcon muted={true} />
        <span className="relative h-1 w-full rounded bg-primary">
          <motion.span
            className="absolute top-0 left-0 h-full max-w-full rounded bg-green-400"
            animate={{
              width: `${volume}%`,
            }}
          />
        </span>
      </div>
      <select
        className="mx-4 w-2/3 rounded bg-primary text-white"
        onChange={(e) => setSelectedInput(e.target.value)}
      >
        {inputs.map((input) => (
          <option key={input.deviceId} value={input.deviceId}>
            {input.label}
          </option>
        ))}
      </select>
    </div>
  )
}
