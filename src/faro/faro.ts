import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk'
import nais from './nais'

// import { TracingInstrumentation } from '@grafana/faro-web-tracing'

let faro: Faro | null = null
export function initInstrumentation(): void {
    if (typeof window === 'undefined' || faro !== null) return

    getFaro()
}

export function getFaro(): Faro {
    if (faro != null) return faro
    faro = initializeFaro({
        url: nais.telemetryCollectorURL,
        app: nais.app,
    })
    return faro
}
