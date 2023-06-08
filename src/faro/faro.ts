import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk'
//import { TracingInstrumentation } from '@grafana/faro-web-tracing'

let faro: Faro | null = null
export function initInstrumentation(): void {
    if (typeof window === 'undefined' || faro !== null) return

    getFaro()
}

export function getFaro(): Faro {
    if (faro != null) return faro
    faro = initializeFaro({
        url: 'https://telemetry.ekstern.dev.nav.no/collect',
        app: {
            name: 'vaktor',
        },
        instrumentations: [
            ...getWebInstrumentations({
                captureConsole: false,
            }),
            // new TracingInstrumentation(),
        ],
    })
    return faro
}
