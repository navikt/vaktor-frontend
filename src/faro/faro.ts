// import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk'
// //import { TracingInstrumentation } from '@grafana/faro-web-tracing'

// let faro: Faro | null = null
// export function initInstrumentation(): void {
//     if (typeof window === 'undefined' || faro !== null) return

//     getFaro()
// }

// export function getFaro(): Faro {
//     if (faro != null) return faro
//     //console.log('The faro url:', process.env.NEXT_PUBLIC_TELEMETRY_URL)
//     faro = initializeFaro({
//         url: 'https://telemetry.dev-gcp.nav.cloud.nais.io/collect',
//         app: {
//             name: 'vaktor',
//         },
//         instrumentations: [
//             ...getWebInstrumentations({
//                 captureConsole: false,
//             }),
//             // new TracingInstrumentation(),
//         ],
//     })
//     return faro
// }
