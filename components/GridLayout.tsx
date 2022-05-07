export default function GridLayout({
  children,
  hero,
  shape,
}: GridLayoutInterface) {
  return (
    <div
      className={`flex-0 grid h-screen max-h-screen w-4/5 grid-flow-col items-center justify-center rounded-lg px-2`}
      style={
        !hero
          ? {
              gridTemplateColumns: `repeat(${Math.ceil(shape)}, 1fr)`,
              gridTemplateRows: `repeat(${Math.round(shape)}, minmax(0, 1fr))`,
              gap: '0.5rem',
              gridAutoRows: '1fr',
              gridAutoColumns: '1fr',
              height: '100%',
            }
          : {
              gridTemplateColumns: `repeat(${Math.ceil(
                shape
              )}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${Math.round(shape)}, minmax(0, 1fr))`,
              gap: '0.1rem',
              gridAutoRows: '1fr',
              gridAutoColumns: '1fr',
              height: '100%',
            }
      }
    >
      {children}
    </div>
  )
}

interface GridLayoutInterface {
  children: React.ReactNode
  hero?: string
  shape: number
}
