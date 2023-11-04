import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

        if (process.env.FAKE_TOKEN) {
            authorizationHeader = process.env.FAKE_TOKEN
        }

        const schedule_id = encodeURIComponent(req.query.schedule_id as string)

        if (!schedule_id) {
            return res.status(400).json({ message: 'Missing required parameter schedule_id' })
        }

        const path = `${process.env.BACKEND_URL}/api/v1/schedules/${schedule_id}/disprove`

        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
            method: 'POST',
        })

        if (backendResponse.ok) {
            const body = await backendResponse.json()
            res.status(200).json(body)
        } else {
            const errorText = await backendResponse.text()
            res.status(backendResponse.status).json({ message: errorText })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
