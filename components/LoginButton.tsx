export default function LoginButton({ children, onClick }: loginButton) {
  return (
    <button
      className="rounded-lg border-2 border-gray-600 bg-transparent py-2 px-4 font-bold text-gray-300 transition duration-200 hover:border-white"
      onClick={async () => await onClick()}
    >
      {children}
    </button>
  )
}

type loginButton = {
  children: any
  onClick: Function
}
