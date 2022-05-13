import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { validate } from 'uuid'
import LoadingIcon from '../components/icons/Loading'

export default function HomeLayout() {
  const router = useRouter()
  const [roomId, setRoomId] = useState<string | any>(null)
  const [joining, setJoining] = useState<boolean>(false)

  useEffect(() => {
    async function getClipboard() {
      const permission = await navigator.permissions.query({
        // @ts-ignore-next-line
        name: 'clipboard-read',
      })
      if (permission.state === 'denied') {
        throw new Error('Permission denied')
      }
      const clipboard = await navigator.clipboard.readText()
      if (validate(clipboard)) {
        setRoomId(clipboard)
      } else {
        setRoomId(null)
      }
    }

    try {
      getClipboard()
    } catch (e) {}
  }, [])

  const isValid = validate(roomId)

  return (
    <div className="flex h-3/4 w-full flex-col justify-evenly md:flex-row">
      <div className="flex w-full flex-col items-start justify-center gap-4 md:w-1/2">
        <h1 className="text-3xl font-bold text-gray-200">
          Videollamadas premium
        </h1>
        <p className="text-gray-400">
          Conecta con tus amigos y comparte tu vídeo llamada
        </p>
        <form
          className="flex w-full flex-col items-center justify-start gap-4 md:w-4/5 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            setJoining(true)
            if (isValid) {
              router.push(`/room/${roomId}`)
            } else {
              setJoining(false)
            }
          }}
        >
          <input
            className="flex-0 main-input relative z-10 w-full border-2 md:w-3/5"
            style={isValid ? {} : { borderColor: 'red' }}
            type="text"
            value={roomId}
            placeholder="ID de la sala"
            onChange={(e) => setRoomId(e.target.value)}
          ></input>

          <div className="inline-flex h-full w-full flex-1 gap-2 text-sm md:w-2/5">
            <AnimatePresence>
              {roomId && (
                <motion.button
                  transition={{
                    duration: 0.5,
                  }}
                  type="submit"
                  className="z-0 inline-flex h-full w-full items-center justify-center rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                >
                  {joining ? <LoadingIcon /> : 'Conectar'}
                </motion.button>
              )}
            </AnimatePresence>
            <Link href="/crear-sala">
              <motion.a
                transition={{
                  duration: 0.5,
                }}
                className="z-0 inline-flex h-full w-96 cursor-pointer items-center justify-center rounded bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700"
              >
                Crear sala
              </motion.a>
            </Link>
          </div>
        </form>

        <p className="text-center text-red-500">
          {!isValid && 'El ID de la sala no es válido'}
        </p>
      </div>
      <div
        className="flex h-full w-full flex-col items-center justify-center md:w-1/2"
        style={{
          backgroundImage: `url("/images/group.svg")`,
          backgroundSize: '75%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
    </div>
  )
}
