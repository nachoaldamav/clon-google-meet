import nhost from '../libs/nhost'

export default function LoginButton({ id, Icon }: loginButton) {
  return (
    <button
      className="rounded-lg border-2 border-gray-600 bg-transparent py-2 px-4 font-bold text-gray-300 transition duration-200 hover:border-white"
      onClick={async () => {
        nhost.auth.signIn({
          // @ts-ignore-next-line
          provider: id,
        })
      }}
    >
      <Icon />
    </button>
  )
}

type loginButton = {
  id: String
  Icon: Function
}
