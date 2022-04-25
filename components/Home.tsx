import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { validate } from 'uuid'

export default function HomeLayout() {
  const router = useRouter()
  const [roomId, setRoomId] = useState<string | any>(null)

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
        console.log('Invalid room id', clipboard)
      }
    }

    try {
      getClipboard()
    } catch (e) {
      console.log(e)
    }
  }, [])

  return (
    <div className="flex h-3/4 w-full flex-row justify-evenly">
      <div className="flex w-1/2 flex-col items-start justify-center gap-4">
        <h1 className="text-3xl font-bold">Videollamadas premium</h1>
        <p className="">Conecta con tus amigos y comparte tu vídeo llamada</p>
        <form
          className="flex w-full flex-row items-center justify-start gap-4 md:w-4/5"
          onSubmit={(e) => {
            e.preventDefault()
            router.push(`/room/${roomId}`)
          }}
        >
          <input
            className="flex-0 relative z-10 w-3/5 rounded-md"
            type="text"
            value={roomId}
            placeholder="ID de la sala"
            onChange={(e) => setRoomId(e.target.value)}
          ></input>

          <div className="inline-flex h-full w-2/5 flex-1 gap-2 text-sm">
            <AnimatePresence>
              {roomId && (
                <motion.button
                  transition={{
                    duration: 0.5,
                  }}
                  type="submit"
                  className="z-0 inline-flex h-full w-full items-center justify-center rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                >
                  Entrar
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
      </div>
      <div
        className="flex h-full w-1/2 flex-col items-center justify-center"
        style={{
          backgroundImage: `url("/images/team.png")`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
    </div>
  )
}
