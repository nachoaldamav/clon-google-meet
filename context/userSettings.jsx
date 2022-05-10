import { useContext, createContext, useEffect, useState } from 'react'

const UserContext = createContext({
  settings: {
    defaultCamera: 'default',
    defaultMicrophone: 'default',
  },
  setSettings: (e) => {},
})

export const UserProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    defaultCamera: 'default',
    defaultMicrophone: 'default',
  })

  useEffect(() => {
    const localSettings = localStorage.getItem('settings')
    if (localSettings) {
      setSettings(JSON.parse(localSettings))
    } else {
      localStorage.setItem(
        'settings',
        JSON.stringify({
          defaultCamera: 'default',
          defaultMicrophone: 'default',
        })
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  return (
    <UserContext.Provider value={{ settings, setSettings }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserSettings = () => {
  const { settings, setSettings } = useContext(UserContext)
  return { settings, setSettings }
}
