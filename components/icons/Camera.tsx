import { motion } from 'framer-motion'
export default function CameraIcon({ hidden = true }: { hidden: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
      {!hidden && (
        <motion.line
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          stroke="currentColor"
          strokeWidth={3}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.2,
          }}
        />
      )}
    </svg>
  )
}
