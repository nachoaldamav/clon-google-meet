import { useState } from 'react'

export default function useCamera() {
  const [camera, setCamera] = useState<MediaDeviceInfo | null>(null)

  return {
    camera,
    setCamera,
  }
}
