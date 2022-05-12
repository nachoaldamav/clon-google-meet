import { useEffect, useState } from 'react'
import { useUserSettings } from '../context/userSettings'
import addLocalVideo from '../utils/addLocalVideo'
import LoadingIcon from './icons/Loading'
import XIcon from './icons/X'

export default function SettingsComponent({ setPopUp }: any) {
  const { settings, setSettings } = useUserSettings()
  const [newSettings, setNewSettings] = useState(settings)
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setInputs(devices)
    })
  }, [])

  const videoDevices = inputs?.filter((device) => device.kind === 'videoinput')
  const audioDevices = inputs?.filter((device) => device.kind === 'audioinput')

  const updateSettings = async () => {
    setLoading(true)
    setSettings(newSettings)
    await addLocalVideo(newSettings)
    setLoading(false)
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setPopUp(false)
    }
  })

  return (
    <div className="absolute inset-0 z-[90] h-full w-full bg-white bg-opacity-10 backdrop-blur">
      <span
        className="absolute inset-0 z-[95] h-full w-full"
        onClick={() => setPopUp(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-fit">
          <div
            className="relative z-[100] overflow-hidden rounded-lg bg-white text-black shadow-lg"
            id="settings-popup"
          >
            <button
              className="absolute top-0 right-0 p-2"
              onClick={() => setPopUp(false)}
            >
              <XIcon />
            </button>
            <div className="flex flex-col gap-2 px-6 py-4">
              <h3 className="mb-2 text-xl font-bold">Configuración</h3>
              <div className="flex flex-col gap-2">
                <label className="mb-2 block text-sm font-bold">Cámara</label>
                <select
                  className="focus:shadow-outline z-90 block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
                  onChange={(e) => {
                    setNewSettings({
                      ...newSettings,
                      defaultCamera: e.target.value,
                    })
                  }}
                  value={newSettings.defaultCamera}
                >
                  {videoDevices?.map((device) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                      className="z-90"
                    >
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="mb-2 block text-sm font-bold">
                  Micrófono
                </label>
                <select
                  className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
                  onChange={(e) => {
                    setNewSettings({
                      ...newSettings,
                      defaultMicrophone: e.target.value,
                    })
                  }}
                  value={newSettings.defaultMicrophone}
                >
                  {audioDevices?.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
                onClick={() => updateSettings()}
              >
                {loading ? (
                  <>
                    <LoadingIcon />
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
