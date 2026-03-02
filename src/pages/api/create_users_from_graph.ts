import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const path = `${process.env.BACKEND_URL}/api/v1/users/create_with_graph`

    try {
        const backendResponse = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        })

        const body = await backendResponse.json()

        if (backendResponse.ok) {
            res.status(200).json(body)
        } else {
            res.status(backendResponse.status).json(body)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
}
