import Head from 'next/head'
import { useAuthenticated, useUserData } from '@nhost/nextjs'
import { useRouter } from 'next/router'
import AuthPanel from '../components/AuthPanel'
import nhost from '../libs/nhost'
import Link from 'next/link'

const Home = () => {
  const router = useRouter()

  const isAuthenticated = useAuthenticated()
  const user = useUserData()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold">
          <span className="text-gray-700">Clon</span>
          <span className="text-gray-500">Meet</span>
        </h1>
        {isAuthenticated ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-gray-700">
              ¡Hola <strong>{user?.displayName}</strong>!
            </p>
            <div className="flex flex-row gap-2">
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  nhost.auth.signOut()
                  router.reload()
                }}
              >
                Cerrar sesión
              </button>
              <Link href="/crear-sala">
                <a className="rounded bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700">
                  Crear sala
                </a>
              </Link>
            </div>
          </div>
        ) : (
          <AuthPanel />
        )}
      </main>
    </div>
  )
}

export default Home
