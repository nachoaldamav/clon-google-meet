import { useState } from 'react'

export default function GridDemo() {
  const [hero, setHero] = useState<string | boolean>(false)
  const [parcitipantsNumber, setParcitipantsNumber] = useState(1)

  const participants = Array.from({ length: parcitipantsNumber }).map(
    (_, i) => ({
      id: i,
      name: `Participant ${i}`,
    })
  )

  const shape = Math.sqrt(participants.length)

  console.log('hero', hero)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900">
      <input
        type="number"
        value={parcitipantsNumber}
        className="absolute top-0 right-0 rounded-full bg-gray-800 p-2 text-white"
        onChange={(e) => setParcitipantsNumber(e.target.valueAsNumber)}
      />
      <div
        className="grid h-full items-center justify-center p-2"
        style={
          !hero
            ? {
                gridTemplateColumns: `repeat(${Math.ceil(shape)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.round(
                  shape
                )}, minmax(0, 1fr))`,
                gap: '0.5rem',
                gridAutoRows: '1fr',
              }
            : {
                gridTemplateColumns: `repeat(${Math.ceil(
                  shape
                )}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${Math.round(
                  shape
                )}, minmax(0, 1fr))`,
                gap: '0.1rem',
                gridAutoRows: '1fr',
              }
        }
      >
        {participants.map((participant, index) => (
          <div
            className={'grid-item h-full w-full'}
            key={index}
            style={
              hero && `participant-${participant.id}` === hero
                ? {
                    gridColumnStart: 1,
                    gridColumnEnd: `${Math.ceil(shape - 1)}`,
                    gridRowStart: 1,
                    gridRowEnd: `${Math.ceil(shape - 1)}`,
                  }
                : {}
            }
          >
            <div
              className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg border bg-gray-800 p-4"
              id={`participant-${participant.id}`}
              onClick={(e) => {
                e.preventDefault()
                console.log('participant', participant)
                setHero(`participant-${participant.id}`)
              }}
            >
              <span className="h-full w-full text-center text-white">
                {participant.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function createStyles(participants: number) {
  const shape = Math.sqrt(participants)

  return {
    gridTemplateColumns: `repeat(${Math.ceil(shape)}, 1fr)`,
    gridTemplateRows: `repeat(${Math.round(shape)}, 1fr)`,
    gap: '0.5rem',
  }
}
