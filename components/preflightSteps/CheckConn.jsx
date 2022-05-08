import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import LoadingIcon from './../icons/Loading'

export default function CheckConn({ setToken, steps, setPreflight }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [stepsLenght, setStepsLenght] = useState(0)

  useEffect(() => {
    setStepsLenght(steps.length)
  }, [steps])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-[#2e2b3b] bg-secondary py-4">
      {!sent && (
        <button
          className="my-2 mx-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
          onClick={() => {
            setLoading(true)
            fetch('/api/get-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: uuidv4(),
                identity: uuidv4(),
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                setLoading(false)
                setSent(true)
                setToken(res.token)
              })
              .catch((err) => {
                setLoading(false)
                setError(true)
              })
          }}
        >
          {loading ? (
            <>
              <LoadingIcon /> Enviando...
            </>
          ) : (
            <>Empezar test</>
          )}
        </button>
      )}
      {sent && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <h3 className="text-center text-sm font-bold">
            {stepsLenght} / 7 test completados
          </h3>
          {stepsLenght >= 7 && !error && (
            <>
              <h4 className="text-center text-sm font-bold text-green-500">
                ¡Todo listo!
              </h4>
              <button
                className="my-2 mx-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  setPreflight(true)
                  window.localStorage.setItem('preflight', true)
                }}
              >
                Finalizar
              </button>
            </>
          )}
          {error && (
            <>
              <h4 className="text-center text-sm font-bold text-red-500">
                Ha ocurrido un error, puede que tengas problemas dentro de la
                videollamada.
              </h4>
              <button
                className="my-2 mx-4 inline-flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-600 px-2 py-1 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  setPreflight(true)
                  window.localStorage.setItem('preflight', true)
                }}
              >
                Continuar igualmente
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
