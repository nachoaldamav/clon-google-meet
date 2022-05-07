import { createContext, ReactChild, useContext, useState } from 'react'

const Context = createContext<any | MediaDeviceInfo>({})

export const useUserCamera = () => {
  return useContext(Context)
}

export function UserCameraProvider({ children }: { children: ReactChild }) {
  const [camera, setCamera] = useState<MediaDeviceInfo>()
  const values = { camera, setCamera }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
