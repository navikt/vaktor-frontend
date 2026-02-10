import '../styles/globals.css'
import '../styles/tidslinje.scss'
import '../styles/globals.css'
import '../styles/ApproveSchema.css'
import '../styles/UpdateSchedule.css'

import '@navikt/ds-css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout/Layout'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default MyApp
