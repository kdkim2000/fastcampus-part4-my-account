import type { AppProps } from 'next/app'
import { Global } from '@emotion/react'
import {
  QueryClientProvider,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useReportWebVitals } from 'next/web-vitals'

import globalSteyls from '@styles/globalStyles'
import Layout from '@shared/Layout'

import Navbar from '@shared/Navbar'
import { AlertContextProvider } from '@contexts/AlertContext'
import ErrorBoundary from '@shared/ErrorBoundary'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

export default function App({
  Component,
  pageProps: { dehydratedState, session, ...pageProps },
}: AppProps) {
  useReportWebVitals((metric) => {
    console.log(metric)
  })

  return (
    <Layout>
      <Global styles={globalSteyls} />
      <SessionProvider session={session}>
        <QueryClientProvider client={client}>
          <HydrationBoundary state={dehydratedState}>
            <ErrorBoundary>
              <AlertContextProvider>
                <Navbar />
                <Component {...pageProps} />
              </AlertContextProvider>
            </ErrorBoundary>
          </HydrationBoundary>
        </QueryClientProvider>
      </SessionProvider>
    </Layout>
  )
}
