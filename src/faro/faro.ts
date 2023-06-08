import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk'

let faro: Faro | null = null

export async function initInstrumentation(): Promise<void> {
  if (typeof window === 'undefined' || faro !== null) return

  const url = await fetch('/vaktor/api/env')
    .then((response) => response.text())
    .catch((error) => {
      console.error('Failed to fetch the faro-url:', error)
      return ''
    })

  console.log('This is the faro-url being used:', url)
  if (url) {
    faro = initializeFaro({
      url,
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
  }
}

export function getFaro(): Faro {
  if (faro !== null) return faro

  throw new Error('Faro has not been initialized.')
}
