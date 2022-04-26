import Head from 'next/head'
import { useAuthenticated, useUserData } from '@nhost/nextjs'
import { useRouter } from 'next/router'
import AuthPanel from '../components/AuthPanel'
import nhost from '../libs/nhost'
import Link from 'next/link'
import HomeLayout from 'components/Home'
import { useEffect, useState } from 'react'

const Home = () => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = useAuthenticated()
  const user = useUserData()

  useEffect(() => {
    setLoading(false)
  }, [isAuthenticated])

  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Clon Meet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="absolute top-0 left-0 mx-4 text-4xl font-bold">
          <span className="text-gray-700">Clon</span>
          <span className="text-gray-500">Meet</span>
        </h1>
        {!loading && (
          <>
            {isAuthenticated && (
              <button
                className="absolute top-0 right-0 mx-4 rounded bg-red-500 py-2 px-4 font-bold text-white transition hover:bg-red-700"
                onClick={() => {
                  nhost.auth.signOut()
                }}
              >
                Cerrar sesión
              </button>
            )}
            {isAuthenticated ? <HomeLayout /> : <AuthPanel />}
          </>
        )}
      </main>
    </div>
  )
}

export default Home
