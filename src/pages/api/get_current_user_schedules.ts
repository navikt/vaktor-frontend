import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

        if (process.env.FAKE_TOKEN) {
            authorizationHeader = process.env.FAKE_TOKEN
        }

        const path = `${process.env.BACKEND_URL}/api/v1/users/me/schedules`

        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        if (!backendResponse.ok) {
            throw new Error('Unable to get schedules from backend')
        }

        const body = await backendResponse.json()

        res.status(200).json(body)
    } catch (error) {
        console.error(error)
        res.status(500).send('Unable to get data from backend')
    }
}
