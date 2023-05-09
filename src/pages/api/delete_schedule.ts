import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers?.authorization ?? 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN
    const schedule_id = encodeURIComponent(req.query.schedule_id as string)

    if (!schedule_id) {
        return res.status(400).json({ message: 'Missing required parameter schedule_id' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/${schedule_id}/delete`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'DELETE',
    })

    const body = await backendResponse.json()

    if (backendResponse.ok && body) {
        res.status(200).json(body)
    } else {
        res.status(500).json({ message: 'Unable to delete schedule' })
    }
}
