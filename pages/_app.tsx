import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NhostNextProvider } from '@nhost/nextjs'
import { UserProvider } from '../context/userSettings'
import nhost from '../libs/nhost'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NhostNextProvider nhost={nhost} initial={pageProps.nhostSession}>
      <Head>
        <title></title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ClonMeet" />
        <meta
          property="og:description"
          content="Aplicación gratuita de videollamadas"
        />
        <meta
          property="og:image"
          content="https://og-image.vercel.app/**Clon**%20meet.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="hackathon-midu.vercel.app" />
        <meta name="twitter:title" content="ClonMeet" />
        <meta
          name="twitter:description"
          content="Aplicación gratuita de videollamadas"
        />
        <meta
          name="twitter:image"
          content="https://og-image.vercel.app/**Clon**%20meet.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg"
        ></meta>
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </NhostNextProvider>
  )
}

export default MyApp
