import { useAuthenticated, useUserData } from '@nhost/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LoadingIcon from '../components/icons/Loading'
import nhost from '../libs/nhost'

export default function CrearSala() {
  const router = useRouter()
  const [error, setError] = useState<any | any>(false)
  const isAuthenticated = useAuthenticated()
  const user = useUserData()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }

    if (user) {
      const room = createRoom(user)
        .then((data) => {
          router.push(`/room/${data.id}`)
        })
        .catch((error) => {
          console.log('Failed creating room: ', error)
          setError(true)
        })
    }
  }, [user, router, isAuthenticated])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-primary text-white">
      {!error ? (
        <h1 className="inline-flex items-center justify-center gap-2 text-2xl font-bold">
          <LoadingIcon />
          Creando Sala...
        </h1>
      ) : (
        <h1 className="inline-flex items-center justify-center gap-2 text-2xl font-bold">
          Error al crear la sala
        </h1>
      )}
    </div>
  )
}

async function createRoom(user: any) {
  const query = `
  mutation MyMutation {
    insert_rooms(objects: {creatorId: "${user.id}"}) {
      returning {
        id
      }
    }
  }`

  const { data, error } = await nhost.graphql.request(query)

  if (error) {
    throw error
  } else {
    return data.insert_rooms.returning[0]
  }
}
