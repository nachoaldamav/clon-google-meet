import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import MicIcon from './icons/Mic'

export default function AudioTest() {
  const [volume, setVolume] = useState(0)

  useEffect(() => {
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
  }, [])

  return (
    <div className="inline-flex w-full items-center gap-2 px-2">
      <MicIcon muted={true} />
      <span className="relative h-1 w-full rounded bg-primary">
        <motion.span
          className="absolute top-0 left-0 h-full rounded bg-green-400"
          animate={{
            width: `${volume}%`,
          }}
        />
      </span>
    </div>
  )
}
