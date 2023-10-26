import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token_endpoint = process.env.TOKEN_ENDPOINT || ''

    /* const config = new URLSearchParams({
        client_id: process.env.CLIENT_ID || '',
        client_secret: process.env.CLIENT_SECRET || '',
        scope: process.env.SCOPE || '',
        grant_type: 'client_credentials',
    })

    console.log('config', config)

    try {
        const response = await fetch(token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: config.toString(),
        })

        console.log('response', response) */

    const { userToken, scope } = req.body

    const oboRequestBody = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_id: process.env.CLIENT_ID || '',
        client_secret: process.env.CLIENT_SECRET || '',
        requested_token_use: 'on_behalf_of',
        assertion: process.env.FAKE_TOKEN || '',
        scope: process.env.SCOPE || '',
    })

    try {
        const response = await fetch(token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: oboRequestBody.toString(),
        })
        console.log('response', response.headers)
        if (!response.ok) {
            const data = await response.json()

            throw new Error(data.error_description)
        }

        const data = await response.json()
        res.status(200).json({ access_token: data.access_token })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}
