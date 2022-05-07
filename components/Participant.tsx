import Avatar from './Avatar'
import RenderName from '../utils/renderName'
import { motion } from 'framer-motion'

export default function ParticipantVideo({
  participant,
  index,
  shape,
  hero,
  setHero,
}: ParticipantVideoProps) {
  return (
    <motion.div
      className="participant relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-transparent p-2"
      key={index}
      id={`participant-${participant.identity}`}
      style={getGrid(shape, participant, hero)}
      onClick={() => {
        if (hero !== `participant-${participant.identity}`) {
          setHero(`participant-${participant.identity}`)
        } else {
          setHero(false)
        }
      }}
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <div className="video relative flex h-full max-h-full w-auto flex-col items-center justify-center self-center bg-secondary">
        <span className="absolute z-0 flex flex-col items-center justify-center">
          <Avatar name={participant.identity} />
          <span className="text-center text-xl font-semibold">
            <RenderName id={participant.identity} />
          </span>
        </span>
      </div>
      <div className="absolute top-0 z-20 w-full rounded-lg bg-opacity-25 p-4 text-center">
        <RenderName id={participant.identity} />
      </div>
    </motion.div>
  )
}

function getGrid(shape: number, participant: Participant, hero: string) {
  return hero && `participant-${participant.identity}` === hero
    ? {
        gridColumnStart: 1,
        gridColumnEnd: `${Math.ceil(shape - 1)}`,
        gridRowStart: 1,
        gridRowEnd: `${Math.ceil(shape - 1)}`,
        height: '100%',
        width: '100%',
      }
    : {
        height: '100%',
        width: '100%',
      }
}

interface ParticipantVideoProps {
  participant: Participant
  index: number
  shape: number
  hero: string
  setHero: (hero: string | boolean) => void
}

type Participant = {
  identity: string
}
