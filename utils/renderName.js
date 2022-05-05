import { useEffect, useState } from 'react'

export default function RenderName({ id, className }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    const getName = async () => {
      const res = await fetch(
        `https://ggtmuhdidjxsglsqyfga.nhost.run/api/rest/get-user/${id}`
      ).then((res) => res.json())
      console.log(res)
      setName(res.user.displayName)
      setLoading(false)
    }
    getName()
  }, [id])

  if (loading) {
    return '...'
  }

  return <span className={className}>{name || 'Usuario anónimo'}</span>
}
