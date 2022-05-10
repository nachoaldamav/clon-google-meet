import { useEffect, useState } from 'react'

export default function RoomTimer({ room }: Room) {
  const [time, setTime] = useState('00:00:00')
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(room.addedDate)
      // @ts-ignore-next-line
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

    return () => clearInterval(interval)
  }, [room])

  return (
    <span className="absolute top-0 inline-flex w-full justify-center p-2 text-xl font-bold text-white">
      {time}
    </span>
  )
}

type Room = {
  room: { addedDate: string }
}
