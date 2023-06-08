import '../styles/globals.css'
import '../styles/tidslinje.scss'
import '../styles/globals.css'
import '../styles/ApproveSchema.css'
import '../styles/UpdateSchedule.css'

import '@navikt/ds-css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'

import { initializeFaro } from '@grafana/faro-web-sdk';
import nais from '../../nais.js';

const faro = initializeFaro({
    url: nais.telemetryCollectorURL,
    app: nais.app
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    )
}

export default MyApp
