import { useEffect, useState } from 'react'
import XIcon from './icons/X'
import confetti from 'canvas-confetti'
import CopyIcon from './icons/Copy'

export default function CopyLink() {
  const [roomId, setRoomId] = useState('')
  const [closed, setClosed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = getRoomId(window.location.href)
    setRoomId(id)
  }, [])

  return (
    !closed && (
      <div className="absolute bottom-0 left-0 z-50 m-2 h-fit w-fit rounded-lg bg-white p-4 text-black md:m-10 md:w-fit">
        <button
          className="absolute top-0 right-0 m-4 rounded border-2 border-transparent transition duration-150 hover:border-gray-200"
          onClick={() => {
            setClosed(true)
          }}
        >
          <XIcon />
        </button>
        <h5 className="mb-4 text-left font-bold text-black">Copiar enlace</h5>
        <div className="flex flex-row items-center gap-0">
          <input
            type="text"
            value={roomId}
            className="relative w-full cursor-text rounded-lg rounded-r-none border-2 border-r-0 border-gray-300 p-2 text-black md:w-fit"
            disabled
          />
          <button
            className="h-full rounded-lg rounded-l-none border-2 border-l-0 border-gray-300 p-2"
            onClick={() => {
              navigator.clipboard.writeText(roomId)
              setCopied(true)
            }}
          >
            <CopyIcon />
          </button>
          {!copied ? (
            <button
              className="ml-2 w-[5em] rounded-lg bg-blue-500 p-2 font-bold text-white"
              id="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://hackathon-midu.vercel.app/room/${roomId}`
                )
                setCopied(true)
                confetti({
                  particleCount: 100,
                  gravity: 0.2,
                  disableForReducedMotion: true,
                  origin: {
                    x: 0.2,
                    y: 1,
                  },
                })
              }}
            >
              Copiar
            </button>
          ) : (
            <button
              className="ml-2 w-[5em] rounded-lg bg-green-700 p-2 font-bold text-white"
              id="copy-button"
              onClick={() => {
                setCopied(false)
              }}
            >
              Copiado
            </button>
          )}
        </div>
      </div>
    )
  )
}

function getRoomId(url: string) {
  const parsedURL = new URL(url)
  const path = parsedURL.pathname
  return path.split('/')[2]
}
