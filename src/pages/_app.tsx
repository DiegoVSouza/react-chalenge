import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const { asPath } = useRouter()

  return (
    <>
      {asPath !== '/' ? <Header /> : <></>}
      <Component {...pageProps} />
    </>
  )
}

export default MyApp;
