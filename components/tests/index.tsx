const Template = ({ children }: any) => {
  return <div className="my-2 flex h-1/3 w-full flex-row">{children}</div>
}

const Title = ({ children }: any) => {
  return <h1 className="text-left text-2xl font-bold">{children}</h1>
}

export function InitialTest({ children }: any) {
  return (
    <Template>
      <div className="flex h-full w-full flex-col">
        <Title>Inicio</Title>
        <p>
          Te guiaremos en los siguientes pasos para que puedas configurar tu
          sistema correctamente.
        </p>
        {children}
      </div>
    </Template>
  )
}

export function VideoTest({ children }: any) {
  return (
    <Template>
      <div className="flex h-full w-full flex-row gap-4">
        <div className="flex h-full w-full flex-col">
          <Title>Cámara</Title>
          <p>
            Para poder usar la cámara de tu dispositivo, debes asegurarte de que
            tienes una cámara conectada a tu dispositivo.
          </p>
          {children}
        </div>
        <div className="flex h-full w-full flex-col">
          <div className="h-60 w-full rounded-md bg-black" />
          <h4 className="text-center text-xl font-bold">
            Tu cámara está funcionando correctamente
          </h4>
        </div>
      </div>
    </Template>
  )
}
