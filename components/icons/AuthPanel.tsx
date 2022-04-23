import nhost from '../../libs/nhost'
import LoadingIcon from '../../components/icons/Loading'
import { useAccessToken, useAuthenticated, useUserData } from '@nhost/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AuthPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formType, setFormType] = useState('login')
  const [error, setError] = useState<NhostError | any>('')
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  })

  const handleLogin = async () => {
    setLoading(true)
    const login = await nhost.auth.signIn({
      email: userData.email,
      password: userData.password,
    })
    console.log('login', login)

    if (login.error) {
      setError(login.error)
    } else {
      setError('')
      setFormType('login')
      router.push('/')
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    const register = await nhost.auth.signUp({
      email: userData.email,
      password: userData.password,
    })
    console.log('register', register)

    if (register.error) {
      setError(register.error)
    } else {
      setError('')
      setFormType('login')
      router.push('/')
    }
  }

  return (
    <div className="my-4 flex flex-col items-center justify-center gap-2">
      <div className="flex flex-row items-center justify-between gap-4">
        <button
          className={
            formType === 'login'
              ? 'rounded-full bg-blue-700 py-2 px-4 font-bold text-white hover:bg-blue-400'
              : 'rounded-full bg-gray-200 py-2 px-4 font-bold text-gray-800 hover:bg-gray-300'
          }
          onClick={() => setFormType('login')}
        >
          Iniciar sesión
        </button>
        <button
          className={
            formType === 'register'
              ? 'rounded-full bg-blue-700 py-2 px-4 font-bold text-white hover:bg-blue-400'
              : 'rounded-full bg-gray-200 py-2 px-4 font-bold text-gray-800 hover:bg-gray-300'
          }
          onClick={() => setFormType('register')}
        >
          Registrarse
        </button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <form
          className="flex flex-col items-center justify-start gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (formType === 'login') {
              handleLogin()
            } else {
              handleRegister()
            }
          }}
        >
          <label className="text-left text-gray-700">Correo electrónico</label>
          <input
            className="rounded-full bg-gray-200 px-4 py-2 text-gray-800"
            type="email"
            placeholder="Email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
          <label className="text-left text-gray-700">Contraseña</label>
          <input
            className="rounded-full bg-gray-200 px-4 py-2 text-gray-800"
            type="password"
            placeholder="Password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
          {!loading && (
            <button
              className="rounded-full bg-gray-200 py-2 px-4 font-bold text-gray-800 hover:bg-gray-300"
              type="submit"
            >
              {formType === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          )}
          {loading && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-200 py-2 px-4 font-bold text-gray-800 hover:bg-gray-300"
              disabled
            >
              <LoadingIcon /> Enviando...
            </button>
          )}
        </form>
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}

type NhostError = {
  code: string
  message: string
}
