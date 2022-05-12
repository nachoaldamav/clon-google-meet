import { useEffect, useState } from 'react'

export default function RenderName({ id, className = '' }: Props) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    const getName = async () => {
      const res = await fetch(
        `https://ggtmuhdidjxsglsqyfga.nhost.run/api/rest/get-user/${id}`
      ).then((res) => res.json())
      setName(res.user.displayName)
      setLoading(false)
    }
    getName()
  }, [id])

  return loading ? (
    <span>...</span>
  ) : (
    <span className={className}>{name || 'Usuario anónimo'}</span>
  )
}

type Props = {
  id: string
  className?: string
}
