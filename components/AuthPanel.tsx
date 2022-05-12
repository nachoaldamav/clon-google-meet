import nhost from '../libs/nhost'
import LoadingIcon from './icons/Loading'
import { useState } from 'react'
import { useRouter } from 'next/router'
import LoginButton from './LoginButton'
import GoogleIcon from './icons/Google'
import GithubIcon from './icons/Github'

export default function AuthPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formType, setFormType] = useState('login')
  const [error, setError] = useState<NhostError | any>('')
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    nickname: '',
  })

  const handleLogin = async () => {
    setLoading(true)
    const login = await nhost.auth.signIn({
      email: userData.email,
      password: userData.password,
    })

    if (login.error) {
      setError(login.error)
    } else {
      setError('')
      setFormType('login')
      if (router.query.redirect) {
        router.push('/' + router.query.redirect)
      } else {
        router.push('/')
      }
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    const register = await nhost.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        displayName: userData.nickname,
      },
    })

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
              ? 'rounded-xl border-2 border-white bg-primary py-2 px-4 font-bold text-gray-200 hover:bg-secondary'
              : 'rounded-xl border-2 border-[#2e2b3b] bg-primary py-2 px-4 font-bold text-gray-200 transition duration-200 hover:border-gray-500 hover:bg-secondary'
          }
          onClick={() => setFormType('login')}
        >
          Iniciar sesión
        </button>
        <button
          className={
            formType === 'register'
              ? 'rounded-xl border-2 border-white bg-primary py-2 px-4 font-bold text-gray-200 hover:bg-secondary'
              : 'rounded-xl border-2 border-[#2e2b3b] bg-primary py-2 px-4 font-bold text-gray-200 transition duration-200 hover:border-gray-500 hover:bg-secondary'
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
          <label className="text-left text-gray-500">Correo electrónico</label>
          <input
            className="main-input"
            type="email"
            placeholder="Email"
            id="email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
          {formType === 'register' && (
            <>
              <label className="text-left text-gray-500">Nickname</label>
              <input
                className="main-input"
                type="text"
                placeholder="Nickname"
                id="nickname"
                maxLength={20}
                value={userData.nickname}
                onChange={(e) =>
                  setUserData({ ...userData, nickname: e.target.value })
                }
              />
            </>
          )}
          <label className="text-left text-gray-500">Contraseña</label>
          <input
            className="main-input"
            type="password"
            placeholder="Password"
            id="password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
          {!loading && (
            <button
              className="rounded-xl bg-gray-200 py-2 px-4 font-bold text-gray-900 hover:bg-gray-300"
              type="submit"
            >
              {formType === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          )}
          {loading && (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-200 py-2 px-4 font-bold text-gray-900 hover:bg-gray-300"
              disabled
            >
              <LoadingIcon /> Enviando...
            </button>
          )}
        </form>
      </div>
      {error && <p className="my-2 text-sm text-red-500">{error.message}</p>}
      <div className="flex w-full flex-col items-center justify-center gap-2 border-t border-t-white">
        <p className="mt-4 text-sm text-gray-100">
          También puedes iniciar sesión con
        </p>
        <div className="flex flex-row items-center justify-center gap-2">
          <LoginButton id="google" Icon={GoogleIcon} />
          <LoginButton id="github" Icon={GithubIcon} />
        </div>
      </div>
    </div>
  )
}

type NhostError = {
  code: string
  message: string
}
