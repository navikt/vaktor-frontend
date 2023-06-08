import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk'
// import { TracingInstrumentation } from '@grafana/faro-web-tracing'

let faro: Faro | null = null
export function initInstrumentation(): void {
    if (typeof window === 'undefined' || faro !== null) return
    getFaro()
}

const url = process.env.NEXT_PUBLIC_TELEMETRY_URL
console.log("This is the faro-url being used:",url)

export function getFaro(): Faro {
    if (faro != null) return faro
    faro = initializeFaro({
        url: url,
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
